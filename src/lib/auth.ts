
'use server';

import type { User } from '@/lib/mock-data';
import { auth } from './firebase-admin';
import { cookies } from 'next/headers';
import { getUserByEmail } from './mock-data';

const SESSION_COOKIE_NAME = 'session';
const SESSION_COOKIE_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function getSession(): Promise<User | null> {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

        if (decodedToken && decodedToken.email) {
             const user = await getUserByEmail(decodedToken.email);
             if (user) {
                return user;
             }
        }
        return null;
    } catch (error) {
        console.error("Error verifying session cookie:", error);
        // Clear the invalid cookie
        cookies().delete(SESSION_COOKIE_NAME);
        return null;
    }
}


export async function createSession(idToken: string) {
    try {
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_EXPIRES_IN });

        cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
            maxAge: SESSION_COOKIE_EXPIRES_IN,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error creating session:", error);
        return { success: false, error: "Falha ao criar sessão no servidor." };
    }
}
