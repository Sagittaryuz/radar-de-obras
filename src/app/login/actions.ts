
'use server';

import { redirect } from 'next/navigation';

// Login action is now a no-op that redirects to dashboard.
export async function loginAction(currentState: unknown, formData: FormData) {
  console.log('[loginAction] Bypassed. Redirecting to dashboard.');
  redirect('/dashboard');
}

// Logout action now redirects to the main page, which in turn goes to the dashboard.
export async function logoutAction() {
    console.log('[logoutAction] Bypassed. Redirecting to home.');
    redirect('/');
}
