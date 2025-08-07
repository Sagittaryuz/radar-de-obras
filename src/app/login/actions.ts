
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase-admin';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase';

const SESSION_COOKIE_NAME = 'session';
const SESSION_COOKIE_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

const LoginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export async function loginAction(formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.email?.[0] || validatedFields.error.flatten().fieldErrors.password?.[0] || 'Dados inválidos.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // This is a workaround to "authenticate" the user on the server side
    // by creating a custom token. This is NOT standard Firebase Auth flow
    // but is required by the environment's constraints.
    
    // First, verify if user exists with the provided email.
    const userRecord = await auth.getUserByEmail(email);

    // This is NOT verifying the password. It's just creating a token.
    // In a real-world scenario, you'd use the client SDK to sign in and send the ID token.
    // But due to HMR issues, we are doing it this way.
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    // Now, use the client SDK to sign in with the custom token to get an ID token
    // We are essentially using the Admin SDK to create a "password-less" sign-in link
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_EXPIRES_IN });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_COOKIE_EXPIRES_IN,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return { success: true };
  } catch (error: any) {
    console.error('[LoginAction Error]', error.code, error.message);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { error: 'E-mail ou senha inválidos.' };
    }
    return { error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.' };
  }
}


export async function logoutAction() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/login');
}
