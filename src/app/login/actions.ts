
'use server';

import { z } from 'zod';
import { login, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/mock-data';
import type { User } from '@/lib/mock-data';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function loginAction(credentials: unknown) {
  const validatedCredentials = loginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    return { error: 'Credenciais inválidas.' };
  }

  const { email, password } = validatedCredentials.data;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error('Firebase Auth Error:', result.error);
      return { error: 'Email ou senha inválidos.' };
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return { error: 'Usuário não encontrado no banco de dados do aplicativo.' };
    }
    
    await login(user);

  } catch (error) {
    console.error('Login Action Error:', error);
    return { error: 'Ocorreu um erro no servidor durante o login.' };
  }

  return { success: true };
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}
