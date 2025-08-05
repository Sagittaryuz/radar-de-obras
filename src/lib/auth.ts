
'use server';

import type { User } from '@/lib/mock-data';

// Hardcoded mock user to simulate a logged-in session.
const MOCK_USER: User = {
  id: 'mock-user-01',
  name: 'Usuário Padrão',
  email: 'marcos.pires@jcruzeiro.com', // Admin email to ensure all features are available
  avatar: 'https://placehold.co/100x100.png',
  role: 'Admin',
};

// getSession now always returns the mock user, effectively bypassing login.
export async function getSession(): Promise<User | null> {
  return MOCK_USER;
}

// Login function is no longer needed.
export async function login(user: User): Promise<void> {
  console.log('[Auth Lib] Login is disabled. No session will be created.');
  return;
}

// Logout function is no longer needed.
export async function logout(): Promise<void> {
    console.log('[Auth Lib] Logout is disabled.');
    return;
}

// Update function is no longer needed in a mock environment.
export async function updateUser(name: string, avatarDataUrl?: string) {
    console.log('[Auth Lib] User update is disabled in mock environment.');
    return { error: "A atualização de perfil está desativada." };
}
