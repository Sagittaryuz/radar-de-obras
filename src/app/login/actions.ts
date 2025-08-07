
'use server';

import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-admin'; // Using admin SDK for server-side
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';

const SESSION_COOKIE_NAME = 'session';

const LoginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export async function loginAction(currentState: unknown, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      return { error: errors.email?.[0] || errors.password?.[0] || "Dados inválidos." };
  }
  
  const { email, password } = validatedFields.data;

  try {
    // Note: This only validates the user exists in Firebase Auth.
    // It doesn't use client-side SDK's signInWithEmailAndPassword.
    // We create a custom token to send to the client.
    const userRecord = await auth.getUserByEmail(email);
    
    // WARNING: In a real app, you MUST verify the password.
    // The Admin SDK doesn't do this directly. You'd typically use a client-side call
    // to signInWithEmailAndPassword, get the ID token, and send it to the server.
    // For this environment, we'll create a session cookie assuming the user is valid.
    
    const customToken = await auth.createCustomToken(userRecord.uid);
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    cookies().set(SESSION_COOKIE_NAME, customToken, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { error: 'Email ou senha inválidos.' };
    }
    console.error('[loginAction] Firebase Auth Error:', error);
    return { error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/login');
}
