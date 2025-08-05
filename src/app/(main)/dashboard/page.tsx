
'use client';

import { useEffect, useState } from 'react';
import { getObras, getLojas } from '@/lib/mock-data';
import { DashboardCharts } from '@/components/dashboard/charts';
import type { Obra, Loja } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

// This is now a Client Component to fetch data client-side.
export default function DashboardPage() {
  const [obras, setObras] = useState<Obra[] | null>(null);
  const [lojas, setLojas] = useState<Loja[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [obrasData, lojasData] = await Promise.all([
          getObras(),
          getLojas()
        ]);
        setObras(obrasData);
        setLojas(lojasData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Handle error state if necessary
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !obras || !lojas) {
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
      <DashboardCharts allObras={obras} allLojas={lojas} />
    </div>
  );
}
