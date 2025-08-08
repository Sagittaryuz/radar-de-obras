
'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">O login foi desativado. Esta página não tem mais funcionalidade.</p>
      </div>
       <Skeleton className="h-64 w-full" />
    </div>
  );
}

