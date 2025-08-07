
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
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        if (!decodedClaims.email) {
            return null;
        }
        // Fetch the full user profile from your database
        const user = await getUserByEmail(decodedClaims.email);
        return user;
    } catch (error) {
        // Session cookie is invalid or expired.
        // It's a good practice to clear the cookie in this case.
        cookies().delete(SESSION_COOKIE_NAME);
        console.error("Session verification failed:", error);
        return null;
    }
}
