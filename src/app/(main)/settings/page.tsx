
'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import UpdateProfileForm from '@/components/settings/update-profile-form';
import UpdatePasswordForm from '@/components/settings/update-password-form';
import type { User } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession();
      setUser(session);
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas informações de conta.</p>
      </div>
      <UpdateProfileForm user={user} />
      <UpdatePasswordForm />
    </div>
  );
}
