
'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from '@/app/login/_components/login-form';
import { Skeleton } from '@/components/ui/skeleton';

function LoginFormSkeleton() {
    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
                <Skeleton className="h-8 w-2/3 mx-auto" />
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}


export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This will run only on the client, after the initial render.
    setIsClient(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {isClient ? <LoginForm /> : <LoginFormSkeleton />}
    </div>
  );
}
