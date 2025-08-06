
'use server';

import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/mock-data';


export async function loginAction(currentState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  try {
    // We will still sign in to get a session cookie, but the primary check is if the user exists in our DB.
    // This assumes the password provided by the user is correct for an existing auth user.
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Firebase auth sign in failed:", error);
    // This mapping handles cases where the user is not in Firebase Auth or password is wrong.
    return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  }

  // Redirect to dashboard on successful Firebase sign-in
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
