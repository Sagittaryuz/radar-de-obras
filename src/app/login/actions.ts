
'use server';

// This file is no longer in use as the login functionality has been removed.
// It is kept to prevent breaking any residual imports, but its functions are now empty.

export async function loginAction(credentials: unknown) {
  console.log('[LoginAction] Login is disabled.');
  return { error: 'O login está desativado.' };
}

export async function logoutAction() {
    console.log('[LogoutAction] Logout is disabled.');
}
