
'use server';

import { z } from 'zod';
import { login, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function loginAction(credentials: unknown) {
  // This server action now only handles setting the cookie after
  // the client has successfully authenticated with Firebase.
  const validatedCredentials = loginSchema.safeParse(credentials);

  if (!validatedCredentials.success) {
    return { error: 'Credenciais inválidas.' };
  }

  const { email, password } = validatedCredentials.data;
  
  try {
    // This login function no longer checks the password. It finds the user
    // and sets the cookie. The actual password check must happen on the client
    // before this action is called.
    const result = await login(email, password);
    if (result.error) {
      return { error: result.error };
    }
  } catch (error) {
    return { error: 'Ocorreu um erro. Tente novamente.' };
  }
  
  // A redirect/reload is handled on the client-side after this action resolves.
  return { success: true };
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}
