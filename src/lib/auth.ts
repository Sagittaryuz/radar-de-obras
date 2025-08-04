
'use server';

import { cookies } from 'next/headers';
import type { User } from '@/lib/mock-data';

const SESSION_COOKIE_NAME = 'jcr_radar_session';

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) return null;

  try {
    const user: User = JSON.parse(sessionCookie.value);
    return user;
  } catch {
    return null;
  }
}

// This function ONLY creates the session cookie.
// Authentication happens on the client with the Firebase SDK.
// User data validation happens in the server action.
export async function login(user: User): Promise<void> {
  console.log(`[Auth Lib] Attempting to set session cookie for: ${user.email}`);
  try {
    // The user object is now passed in directly from the validated action.
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(user), {
        expires,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
    console.log(`[Auth Lib] Session cookie set successfully for ${user.email}`);
  } catch (error: any) {
    // Log the detailed error on the server.
    console.error('[Auth Lib] FAILED to set session cookie:', error);
    // Throw a new error to be caught by the server action.
    throw new Error('Ocorreu um erro no servidor ao criar a sessão.');
  }
}

export async function logout(): Promise<void> {
  cookies().set(SESSION_COOKIE_NAME, '', { expires: new Date(0) });
}

export async function updateUser(updatedData: Partial<User>): Promise<void> {
    const session = await getSession();
    if (!session) {
        throw new Error("No active session");
    }

    const updatedUser = { ...session, ...updatedData };

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(updatedUser), { expires, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
}
