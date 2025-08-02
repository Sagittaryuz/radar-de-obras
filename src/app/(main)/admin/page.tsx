import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { getUsers, getLojas } from "@/lib/mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | JCR Radar',
};

export default async function AdminPage() {
  const session = await getSession();

  if (session?.email !== 'marcos.pires@jcruzeiro.com') {
    redirect('/dashboard');
  }

  const users = await getUsers();
  const lojas = await getLojas();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Painel de Administração</h1>
      <AdminTabs users={users} lojas={lojas} />
    </div>
  );
}
