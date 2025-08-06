import type { User } from '@/lib/mock-data';

// Since login is removed, getSession always returns a default mock user.
export async function getSession(): Promise<User> {
  // This function now guarantees a user object is returned, simplifying session checks.
  return {
    id: 'mock-user-id',
    name: 'Marcos Pires',
    email: 'marcos.pires@jcruzeiro.com',
    avatar: 'https://placehold.co/100x100.png',
    role: 'Admin',
  };
}
