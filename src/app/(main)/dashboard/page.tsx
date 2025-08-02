'use client';

import { useState, useEffect } from 'react';
import { getObras, getLojas } from '@/lib/mock-data';
import { DashboardCharts } from '@/components/dashboard/charts';
import type { Obra, Loja } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [obrasData, lojasData] = await Promise.all([
          getObras(),
          getLojas(),
        ]);
        setObras(obrasData);
        setLojas(lojasData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h1>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[350px] w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
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
