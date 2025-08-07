
import { LoginForm } from './_components/login-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    const session = await getSession();
    if (session) {
        redirect('/dashboard');
    }
    return <LoginForm />;
}
