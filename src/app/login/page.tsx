
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // Redirect immediately to the dashboard as login is no longer required.
  redirect('/dashboard');
}
