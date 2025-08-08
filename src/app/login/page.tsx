
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LoginForm } from './_components/login-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, redirect them away from the login page.
                router.push('/dashboard');
            } else {
                // No user is signed in, safe to show the login form.
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Skeleton className="h-[480px] w-full max-w-sm" />
            </div>
        );
    }
    
    return <LoginForm />;
}
