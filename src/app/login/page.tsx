
import { Building2 } from 'lucide-react';
import { LoginForm } from './_components/login-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="font-headline text-3xl font-bold mt-4">Radar de Obras</h1>
          <p className="text-muted-foreground">J. Cruzeiro</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
