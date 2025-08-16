
'use client';

import { AdminTabs } from "@/components/admin/admin-tabs";
import { getUsers, getLojas } from "@/lib/firestore-data";
import { useEffect, useState } from "react";
import { User, Loja } from "@/lib/firestore-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";


export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataCallback, setDataCallback] = useState(0);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();


  // Page guard
  useEffect(() => {
    if (!authLoading) {
        if (!user || user.role !== 'Admin') {
            router.push('/dashboard');
        }
    }
  }, [user, authLoading, router]);
  
  const fetchData = () => {
      setDataCallback(prev => prev + 1);
  }

  useEffect(() => {
    const doFetch = async () => {
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
    
    if (!authLoading && user?.role === 'Admin') {
        doFetch();
    }
  }, [user, authLoading, dataCallback]);
  
  if (authLoading || loading || user?.role !== 'Admin' || !user) {
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
      <AdminTabs users={users} lojas={lojas} onUserUpdate={fetchData} />
    </div>
  );
}
