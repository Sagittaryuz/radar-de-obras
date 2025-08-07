
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';

export async function logoutAction() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/login');
}
