
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
    return { error: 'Credenciais inválidas.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await signOut(auth);
  redirect('/login');
}
