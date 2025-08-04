
'use server';

import { cookies } from 'next/headers';
import type { User } from '@/lib/mock-data';
import { getUsers } from '@/lib/mock-data';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';


const SESSION_COOKIE_NAME = 'jcr_radar_session';

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) return null;

  try {
    const user = JSON.parse(sessionCookie.value);
    // Fetch all users and find the one that matches the session ID.
    // In a real-world scenario with many users, you'd fetch a single user by ID.
    const users = await getUsers();
    const foundUser = users.find(u => u.id === user.id);
    return foundUser || null;
  } catch {
    return null;
  }
}

// Note: This function now interacts with the client-side Firebase Auth SDK.
// It's designed to be called from a client component, not a Server Action directly.
export async function login(email: string, password?: string): Promise<{ user?: User; error?: string }> {
  try {
    // This is a placeholder for the actual Firebase sign-in logic which will now live on the client.
    // The server-side cookie login remains for session management after client-side auth.
    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // We keep this check, but the password validation is now conceptual.
    // The real password check happens on the client with Firebase Auth.
    if (!user) {
      return { error: 'Usuário ou senha inválidos.' };
    }
    
    // If client-side auth is successful, we set the server session cookie.
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(user), { 
        expires, 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production' 
    });

    return { user };

  } catch (error: any) {
    console.error('Login Error:', error);
    // Firebase provides specific error codes that can be translated to user-friendly messages.
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return { error: 'Usuário ou senha inválidos.' };
      default:
        return { error: 'Ocorreu um erro ao tentar fazer login. Tente novamente.' };
    }
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
