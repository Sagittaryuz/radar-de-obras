import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UpdateProfileForm from '@/components/settings/update-profile-form';
import UpdatePasswordForm from '@/components/settings/update-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurações | JCR Radar',
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas informações de conta.</p>
      </div>
      <UpdateProfileForm user={session} />
      <UpdatePasswordForm />
    </div>
  );
}
