
'use client';

import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/obras/kanban-board';
import { NewObraDialog } from '@/components/obras/new-obra-dialog';
import { getObras, getUsers } from '@/lib/mock-data';
import type { Obra, User } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function ObrasPage() {
  const [initialObras, setInitialObras] = useState<Obra[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [obrasData, sellersData] = await Promise.all([
          getObras(),
          getUsers(),
        ]);
        setInitialObras(obrasData);
        setSellers(sellersData);
      } catch (error) {
        console.error("Failed to fetch obras page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
     return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Quadro de Obras</h1>
        <NewObraDialog />
      </div>
      <KanbanBoard initialObras={initialObras} sellers={sellers} />
    </div>
  );
}
