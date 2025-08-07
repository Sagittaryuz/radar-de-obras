
'use client';

import { Logo } from '@/components/logo';
import { LoginForm } from './_components/login-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/mock-data';

function LoginSkeleton() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm animate-pulse">
                <div className="mb-6 h-8 w-40 bg-muted rounded-md mx-auto"></div>
                <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                    <div className="space-y-2 text-center">
                        <div className="h-6 w-24 bg-muted rounded-md mx-auto"></div>
                        <div className="h-4 w-full max-w-xs bg-muted rounded-md mx-auto"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <div className="h-4 w-16 bg-muted rounded-md"></div>
                             <div className="h-10 w-full bg-muted rounded-md"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-16 bg-muted rounded-md"></div>
                            <div className="h-10 w-full bg-muted rounded-md"></div>
                        </div>
                    </div>
                    <div className="h-10 w-full bg-muted rounded-md mt-4"></div>
                </div>
            </div>
        </div>
    )
}


export default function LoginPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        redirect('/dashboard');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return <LoginSkeleton />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
            <Logo />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
