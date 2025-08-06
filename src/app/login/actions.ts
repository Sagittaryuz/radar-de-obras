
'use server';

import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { redirect } from 'next/navigation';

export async function loginAction(currentState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // Firebase often returns generic auth errors. We'll map them to a user-friendly message.
    return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
        // Even if sign out fails on firebase, we still want to redirect the user.
    }
    redirect('/login');
}
