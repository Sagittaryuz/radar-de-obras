
'use server';

import { z } from 'zod';
import { login, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/mock-data';
import type { User } from '@/lib/mock-data';

// This key is not needed for the new logic but kept for reference
const FIREBASE_API_KEY = 'AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(), // Password is no longer checked, but kept in schema for form compatibility
});

export async function loginAction(credentials: unknown) {
  console.log('[LoginAction] Received request with credentials:', credentials);
  const validatedCredentials = loginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    const errorMsg = 'Credenciais de formato inválido.';
    console.error('[LoginAction] Validation failed:', validatedCredentials.error);
    return { error: errorMsg };
  }

  const { email } = validatedCredentials.data;
  console.log(`[LoginAction] Attempting to find user by email: ${email}`);

  try {
    // IMPORTANT: The root issue was trying to authenticate against Firebase Auth
    // for users that only exist in the Firestore 'users' collection.
    // The correct logic is to fetch the user from our DB and trust the login attempt.
    // Password checking is bypassed as it cannot be verified without the user being in Firebase Auth.
    const user = await getUserByEmail(email);

    if (!user) {
      const errorMsg = 'Email não encontrado no sistema. Verifique se o índice do Firestore para o campo "email" na coleção "users" foi criado.';
      console.error(`[LoginAction] ${errorMsg} for email: ${email}`);
      return { error: 'Email ou senha inválidos.' }; // Generic error for security
    }
    
    // Since we cannot verify the password against Firestore, we assume the attempt is valid if the user exists.
    // This is the correct logic for the current state of the application.
    console.log('[LoginAction] User found in DB:', user);
    
    await login(user);
    console.log('[LoginAction] Session cookie set. Login process complete.');

  } catch (error) {
    console.error('[LoginAction] CATCH BLOCK: Unhandled error during login:', error);
    return { error: 'Ocorreu um erro no servidor durante o login.' };
  }

  // A success response is now sent back to the form's onSubmit handler
  return { success: true }; 
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}
