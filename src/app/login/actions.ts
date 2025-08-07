
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth as adminAuth } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSession(idToken: string) {
  if (!adminAuth) {
    console.error("Firebase Admin auth is not initialized. Cannot create session cookie.");
    return { error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.' };
  }

  try {
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    
    // Only generate session cookie if the token is valid and not expired.
    if (new Date().getTime() / 1000 < decodedIdToken.auth_time) {
        return { error: 'O token fornecido é de uma data futura.' };
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });

  } catch (error) {
    console.error("Failed to create session cookie:", error);
    return { error: 'Não foi possível criar a sessão. Tente novamente.' };
  }
}


export async function logoutAction() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/login');
}
