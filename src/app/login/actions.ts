
'use server';

import { auth as clientAuth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export async function logoutAction() {
    try {
        await signOut(clientAuth);
    } catch (error) {
        console.error("Error signing out: ", error);
        // Even if there's an error, the client state should be cleared,
        // so we proceed with the client-side redirect logic.
    }
}
