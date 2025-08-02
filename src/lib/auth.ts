'use server';

import { cookies } from 'next/headers';
import type { User } from '@/lib/mock-data';
import { users } from '@/lib/mock-data';

const SESSION_COOKIE_NAME = 'jcr_radar_session';

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = await cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function login(email: string, password?: string): Promise<{ user?: User; error?: string }> {
  // NOTE: This is a mock authentication. In a real app, you would validate
  // the password against a hashed version in your database.
  // For this demo, we'll just check if the user exists and the password is '123456'.
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || password !== '123456') {
      return { error: 'Usuário ou senha inválidos.' };
  }

  try {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(user), { expires, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

    return { user };
  } catch (error: any) {
    console.error('Login Error:', error);
    return { error: 'Ocorreu um erro ao tentar fazer login. Tente novamente.' };
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
