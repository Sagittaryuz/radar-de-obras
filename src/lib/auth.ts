
'use server';

import type { User } from '@/lib/mock-data';
import { auth } from './firebase-admin';
import { cookies } from 'next/headers';
import { getUserByEmail } from './mock-data';

const SESSION_COOKIE_NAME = 'session';

export async function getSession(): Promise<User | null> {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedToken = await auth.verifyIdToken(sessionCookie);
        if (decodedToken && decodedToken.email) {
             const user = await getUserByEmail(decodedToken.email);
             if (user) {
                return user;
             }
        }
        return null;
    } catch (error) {
        console.error("Error verifying session cookie:", error);
        return null;
    }
}
