import { cookies } from 'next/headers';
import type { User } from '@/lib/mock-data';
import { users } from '@/lib/mock-data';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from './firebase';

const SESSION_COOKIE_NAME = 'jcr_radar_session';

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function login(email: string, password?: string): Promise<{ user?: User; error?: string }> {
  const auth = getAuth(app);
  try {
    if (!password) {
        return { error: 'Senha não informada.' };
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Use mock data for user details not in firebase auth by default
    const mockUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    const user: User = {
        id: firebaseUser.uid,
        name: mockUser?.name || firebaseUser.displayName || 'Usuário',
        email: firebaseUser.email!,
        avatar: mockUser?.avatar || firebaseUser.photoURL || '',
        role: mockUser?.role || 'Vendedor'
    };

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(user), { expires, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

    return { user };
  } catch (error: any) {
    console.error('Firebase Login Error:', error);
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return { error: 'Usuário ou senha inválidos.' };
      default:
        return { error: 'Ocorreu um erro ao tentar fazer login. Tente novamente.' };
    }
  }
}

export async function logout(): Promise<void> {
  cookies().set(SESSION_COOKIE_NAME, '', { expires: new Date(0) });
}

export async function updateUser(updatedData: Partial<User>): Promise<void> {
    const session = await getSession();
    if (!session) {
        throw new Error("No active session");
    }

    const updatedUser = { ...session, ...updatedData };

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(updatedUser), { expires, httpOnly: true });
}
