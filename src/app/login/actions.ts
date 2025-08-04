
'use server';

import { z } from 'zod';
import { login, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { User } from '@/lib/mock-data';

// This schema is now for the user object passed from the client
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().or(z.literal('')),
  role: z.enum(['Vendedor', 'Admin']),
});

export async function loginAction(userData: User) {
  // This server action now only handles setting the cookie after
  // the client has successfully authenticated with Firebase and passed the user data.
  const validatedUser = userSchema.safeParse(userData);

  if (!validatedUser.success) {
    console.error("Invalid user data received by server action:", validatedUser.error);
    return { error: 'Dados do usuário inválidos.' };
  }

  try {
    // This login function no longer validates credentials or fetches from DB.
    // It just sets the cookie with the provided user data.
    await login(validatedUser.data);
  } catch (error) {
    console.error("Server action login failed:", error);
    return { error: 'Ocorreu um erro no servidor ao criar a sessão.' };
  }
  
  // A redirect/reload is handled on the client-side after this action resolves.
  return { success: true };
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}
