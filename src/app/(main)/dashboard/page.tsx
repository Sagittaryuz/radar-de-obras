import { getObras } from '@/lib/mock-data';
import { DashboardCharts } from '@/components/dashboard/charts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | JCR Radar',
};

export default async function DashboardPage() {
  const obras = await getObras();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h1>
      <DashboardCharts obras={obras} />
    </div>
  );
}
