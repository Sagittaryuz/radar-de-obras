
'use server';

import { z } from 'zod';
import { login, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/mock-data';
import type { User } from '@/lib/mock-data';

const FIREBASE_API_KEY = 'AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function loginAction(credentials: unknown) {
  console.log('[LoginAction] Received request with credentials:', credentials);
  const validatedCredentials = loginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    const errorMsg = 'Credenciais inválidas.';
    console.error('[LoginAction] Validation failed:', validatedCredentials.error);
    return { error: errorMsg };
  }

  const { email, password } = validatedCredentials.data;
  console.log(`[LoginAction] Attempting login for email: ${email}`);

  try {
    const firebaseApiUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
    console.log('[LoginAction] Calling Firebase Auth API:', firebaseApiUrl);
    
    const response = await fetch(firebaseApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const result = await response.json();
    console.log('[LoginAction] Firebase Auth API response status:', response.status);
    console.log('[LoginAction] Firebase Auth API response body:', result);

    if (!response.ok || result.error) {
      const errorMsg = result.error?.message || 'Email ou senha inválidos.';
      console.error('[LoginAction] Firebase Auth Error:', errorMsg);
      return { error: 'Email ou senha inválidos.' };
    }

    console.log('[LoginAction] Firebase Auth successful. Fetching user from DB...');
    const user = await getUserByEmail(email);

    if (!user) {
      const errorMsg = 'Usuário não encontrado no banco de dados do aplicativo.';
      console.error(`[LoginAction] ${errorMsg} for email: ${email}`);
      return { error: errorMsg };
    }
    
    console.log('[LoginAction] User found in DB:', user);
    await login(user);
    console.log('[LoginAction] Session cookie set. Login process complete.');

  } catch (error) {
    console.error('[LoginAction] CATCH BLOCK: Unhandled error during login:', error);
    return { error: 'Ocorreu um erro no servidor durante o login.' };
  }

  return { success: true };
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}
