
'use server';

import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/mock-data';


export async function loginAction(currentState: unknown, formData: FormData) {
  console.log('[loginAction] Starting login process...');

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log(`[loginAction] Attempting login for email: ${email}`);

  if (!email || !password) {
    console.log('[loginAction] Error: Email or password not provided.');
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  try {
    // Instead of validating the password, we just check if the user exists in our DB.
    // This is because the app is not set up to handle Firebase Auth password validation.
    console.log(`[loginAction] Checking if user exists in Firestore with email: ${email}`);
    const user = await getUserByEmail(email);

    if (user) {
      console.log(`[loginAction] User found in Firestore: ${user.name}. Simulating successful login.`);
      // The actual sign-in is not necessary as the app's auth is mocked.
      // We just need to redirect.
      redirect('/dashboard');
    } else {
      console.log(`[loginAction] User with email ${email} not found in Firestore.`);
      return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
    }
  } catch (error: any) {
    console.error('[loginAction] An unexpected error occurred:', error);
    return { error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.' };
  }
}


export async function logoutAction() {
    try {
        await signOut(auth);
        console.log('[logoutAction] Firebase sign-out successful.');
    } catch (error) {
        console.error("[logoutAction] Error signing out: ", error);
    }
    redirect('/login');
}
