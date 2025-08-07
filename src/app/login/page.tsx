
import { redirect } from 'next/navigation';

// This page is no longer needed as we are using a mock session.
// Redirect any access to this page to the dashboard.
export default function LoginPage() {
    redirect('/dashboard');
}
