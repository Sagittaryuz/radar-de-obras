
import { redirect } from 'next/navigation';

// Since login is removed, redirect anyone trying to access this page.
export default function LoginPage() {
    redirect('/dashboard');
}
