
'use server';

import { z } from 'zod';
import { login, logout } from '@/lib/auth'; // Import logout
import { redirect } from 'next/navigation';
import type { User } from '@/lib/mock-data';

// This schema validates the user data coming from the client form.
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().or(z.literal('')),
  role: z.enum(['Vendedor', 'Admin']),
});

export async function loginAction(userData: User) {
  // 1. Validate the user data received from the client.
  const validatedUser = userSchema.safeParse(userData);

  if (!validatedUser.success) {
    console.error("Invalid user data received by server action:", validatedUser.error);
    return { error: 'Dados do usuário inválidos.' };
  }

  // 2. The user is already authenticated by Firebase on the client.
  // We just need to create the session cookie.
  try {
    await login(validatedUser.data);
  } catch (error) {
    // This will now have the detailed error from the auth.ts file
    return { error: 'Ocorreu um erro no servidor ao criar a sessão.' };
  }

  // 3. The 'redirect' function should not be called here.
  // The client will handle the redirect after this action completes.
  // This is a more robust pattern.
  return { success: true };
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}
