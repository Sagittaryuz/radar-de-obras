
'use server';

import { z } from 'zod';
import { login, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { User } from '@/lib/mock-data';

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().or(z.literal('')),
  role: z.enum(['Vendedor', 'Admin']),
});

export async function loginAction(userData: User) {
  const validatedUser = userSchema.safeParse(userData);

  if (!validatedUser.success) {
    console.error("Invalid user data received by server action:", validatedUser.error);
    return { error: 'Dados do usuário inválidos.' };
  }

  try {
    await login(validatedUser.data);
  } catch (error) {
    console.error("Server action login failed:", error);
    return { error: 'Ocorreu um erro no servidor ao criar a sessão.' };
  }
  
  return { success: true };
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}
