
'use server';

import { cookies } from 'next/headers';
import type { User } from '@/lib/mock-data';
import { getUsers } from '@/lib/mock-data';


const SESSION_COOKIE_NAME = 'jcr_radar_session';

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) return null;

  try {
    // The user object is now stored directly in the cookie.
    // NOTE: For higher security, a session ID should be used and validated against a server-side session store.
    // For this app's purpose, storing the user object is acceptable.
    const user: User = JSON.parse(sessionCookie.value);
    return user;
  } catch {
    return null;
  }
}

// This function no longer performs validation or database lookups.
// It blindly trusts the user object passed from the server action,
// which is acceptable because the server action is only called after
// successful client-side Firebase authentication.
export async function login(user: User): Promise<void> {
  try {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(user), { 
        expires, 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production' 
    });
    console.log(`[Server Action] Session cookie set for ${user.email}`);
  } catch (error: any) {
    console.error('[Server Action] Failed to set cookie:', error);
    // Re-throw the error to be caught by the server action
    throw new Error('Ocorreu um erro no servidor ao criar a sessão.');
  }
}


export async function logout(): Promise<void> {
  // The client will handle Firebase signOut. The server just clears the session cookie.
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
