
'use server';

import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/mock-data';


export async function loginAction(currentState: unknown, formData: FormData) {
  console.log('[loginAction] Starting...');
  
  // Log the raw form data entries
  console.log('[loginAction] FormData entries:', Array.from(formData.entries()));

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log(`[loginAction] Extracted - Email: ${email}, Password: ${password ? '******' : '(empty)'}`);


  if (!email || !password) {
    console.log('[loginAction] Error: Email or password missing.');
    return { error: 'E-mail e senha são obrigatórios.' };
  }
  
  console.log(`[loginAction] Attempting to sign in with email: ${email}`);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log(`[loginAction] Firebase sign-in successful for ${email}.`);
  } catch (error: any) {
    console.error("[loginAction] Firebase auth sign in failed. Error Code:", error.code, "Error Message:", error.message);
    return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  }

  console.log('[loginAction] Redirecting to /dashboard');
  redirect('/dashboard');
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
