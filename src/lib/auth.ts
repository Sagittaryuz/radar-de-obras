
'use server';

import { cookies } from 'next/headers';
import type { User } from '@/lib/mock-data';
import { updateUserProfile } from './actions';

const SESSION_COOKIE_NAME = 'jcr_radar_session';

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) return null;

  try {
    const user: User = JSON.parse(sessionCookie.value);
    return user;
  } catch {
    return null;
  }
}

export async function login(user: User): Promise<void> {
  console.log(`[Auth Lib] Attempting to set session cookie for: ${user.email}`);
  try {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(user), {
        expires,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
    console.log(`[Auth Lib] Session cookie set successfully for ${user.email}`);
  } catch (error: any) {
    console.error('[Auth Lib] FAILED to set session cookie:', error);
    throw new Error('Ocorreu um erro no servidor ao criar a sessão.');
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', { expires: new Date(0) });
}

export async function updateUser(name: string, avatarDataUrl?: string) {
    const session = await getSession();
    if (!session) {
        throw new Error("No active session");
    }

    try {
        // Persist changes to the database
        const result = await updateUserProfile(session.id, name, avatarDataUrl);
        if (result.error) {
            throw new Error(result.error);
        }

        // Update the session cookie with the new data
        const updatedUser: User = { 
            ...session, 
            name,
        };
        
        // If a new avatar was uploaded, use the new URL from the action's result
        if (result.updatedAvatarUrl) {
            updatedUser.avatar = result.updatedAvatarUrl;
        }

        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(updatedUser), { 
            expires, 
            httpOnly: true, 
            sameSite: 'lax', 
            secure: process.env.NODE_ENV === 'production' 
        });

        return { success: true };
    } catch(error) {
        console.error("Error in updateUser auth function:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { error: errorMessage };
    }
}
