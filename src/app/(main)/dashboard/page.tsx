
'use client';

import { useEffect, useState } from 'react';
import { getObras, getLojas, getUsers } from '@/lib/firestore-data';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import type { Obra, Loja, User } from '@/lib/firestore-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [obras, setObras] = useState<Obra[] | null>(null);
  const [lojas, setLojas] = useState<Loja[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [obrasData, lojasData, usersData] = await Promise.all([
          getObras(),
          getLojas(),
          getUsers()
        ]);
        setObras(obrasData);
        setLojas(lojasData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !obras || !lojas || !users) {
    return (
       <div className="space-y-6">
          <Skeleton className="h-8 w-full max-w-sm" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              <Skeleton className="h-[24rem] w-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardTabs allObras={obras} allLojas={lojas} allUsers={users} />
    </div>
  );
}
