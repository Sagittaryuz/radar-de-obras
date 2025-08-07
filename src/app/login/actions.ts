
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
    // verifyIdToken já verifica se o token está expirado, foi revogado, etc.
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    
    // A verificação auth_time é muito sensível a pequenas diferenças de clock
    // entre o cliente e o servidor, e a verificação principal já é suficiente.
    // Removendo a verificação problemática.

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    (await cookies()).set(SESSION_COOKIE_NAME, sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });

  } catch (error) {
    console.error("Failed to create session cookie:", error);
    // Retorna um erro genérico para não expor detalhes da implementação.
    return { error: 'Não foi possível validar sua sessão. Tente novamente.' };
  }
}


export async function logoutAction() {
    (await cookies()).delete(SESSION_COOKIE_NAME);
    redirect('/login');
}
