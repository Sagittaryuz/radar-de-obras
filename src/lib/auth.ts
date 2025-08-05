
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/mock-data';
import { onAuthStateChanged } from 'firebase/auth';

export async function getSession(): Promise<User | null> {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve({
          id: user.uid,
          name: user.displayName || 'Usuário Anônimo',
          email: user.email || '',
          avatar: user.photoURL || 'https://placehold.co/100x100.png',
          role: 'Admin', // Default role, adjust as needed
        });
      } else {
        resolve(null);
      }
    });
  });
}
