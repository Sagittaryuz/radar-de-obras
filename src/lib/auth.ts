
'use server';

import { cookies } from 'next/headers';
import type { User } from '@/lib/mock-data';
import { getUsers } from '@/lib/mock-data';
import { getAuth } from 'firebase/auth';
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

// Note: This function no longer performs Firebase sign-in. It only handles the session cookie.
// The client-side component now handles the Firebase authentication.
export async function login(email: string): Promise<{ user?: User; error?: string }> {
  console.log(`[Server Action] Login attempt for email: ${email}`); // LOG: Início da Ação
  try {
    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // The password check is no longer done here, but we still need to find the user.
    if (!user) {
      // This error should theoretically not be hit if client-side auth succeeds,
      // but it's a good safeguard.
      console.error(`[Server Action] User not found in DB for email: ${email}`); // LOG: Erro de usuário não encontrado
      return { error: 'Usuário não encontrado no banco de dados do aplicativo.' };
    }
    
    // Set the server-side session cookie.
    console.log(`[Server Action] User found: ${user.name}. Setting session cookie.`); // LOG: Sucesso ao encontrar usuário
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(user), { 
        expires, 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production' 
    });

    return { user };

  } catch (error: any) {
    console.error('[Server Action] Login function failed with error:', error); // LOG: Erro completo no catch
    return { error: 'Ocorreu um erro no servidor ao criar a sessão.' };
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
