'use server';

import { z } from 'zod';
import { login, logout as authLogout } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
    const result = await login(email, password);
    if (result.error) {
      return { error: result.error };
    }
  } catch (error) {
    return { error: 'Ocorreu um erro. Tente novamente.' };
  }
  
  // The redirect is handled on the client-side.
  return { success: true };
}

export async function logoutAction() {
  await authLogout();
  redirect('/login');
}
