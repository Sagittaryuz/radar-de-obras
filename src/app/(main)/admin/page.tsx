
'use client';

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { getUsers, getLojas } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { User, Loja } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  // Session check can remain here, but data fetching moves to client-side.
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.email !== 'marcos.pires@jcruzeiro.com') {
        redirect('/dashboard');
      }
    };
    checkSession();
  }, []);

  const [users, setUsers] = useState<User[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, lojasData] = await Promise.all([
            getUsers(),
            getLojas(),
        ]);
        setUsers(usersData);
        setLojas(lojasData);
      } catch (error) {
          console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }


  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Painel de Administração</h1>
      <AdminTabs users={users} lojas={lojas} />
    </div>
  );
}
