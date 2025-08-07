
'use server';

import type { User } from '@/lib/mock-data';
// We are mocking the session to avoid server-side auth errors during development
// In a real app, you would uncomment the firebase-admin logic
// import { auth } from './firebase-admin';
// import { cookies } from 'next/headers';
import { getUserByEmail } from './mock-data';

// const SESSION_COOKIE_NAME = 'session';

export async function getSession(): Promise<User | null> {
    // This is a mock session. It will always return the first user found.
    // This avoids the need for login during development.
    try {
        const mockUser = await getUserByEmail("vendedor.jcruzeiro@gmail.com");
        return mockUser || null;
    } catch (e) {
        console.error("Failed to get mock user for session", e);
        return null;
    }
}
