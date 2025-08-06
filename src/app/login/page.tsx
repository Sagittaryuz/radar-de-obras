
import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect directly to the dashboard, bypassing login.
  redirect('/dashboard');
}
