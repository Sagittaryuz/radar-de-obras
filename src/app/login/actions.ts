
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth as adminAuth } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSession(idToken: string) {
  console.log('[createSession] Action called.');
  if (!adminAuth) {
    console.error("[createSession] Firebase Admin auth is not initialized.");
    return { error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.' };
  }

  try {
    console.log('[createSession] Verifying ID token...');
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    console.log('[createSession] ID token verified successfully for UID:', decodedIdToken.uid);
    
    console.log('[createSession] Creating session cookie...');
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log('[createSession] Session cookie created.');

    const options = {
        name: SESSION_COOKIE_NAME,
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    };
    
    console.log('[createSession] Setting cookie in browser with options:', options);
    cookies().set(options);
    console.log('[createSession] Cookie set successfully.');
    
    return { success: true };

  } catch (error) {
    console.error("[createSession] Failed to create session cookie:", error);
    // Retorna um erro genérico para não expor detalhes da implementação.
    return { error: 'Não foi possível validar sua sessão. Tente novamente.' };
  }
}


export async function logoutAction() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/login');
}
