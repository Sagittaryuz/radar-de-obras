
import { getObras, getLojas } from '@/lib/mock-data';
import { DashboardCharts } from '@/components/dashboard/charts';
import type { Obra, Loja } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | JCR Radar',
};

export default async function DashboardPage() {
  const obras = await getObras();
  const lojas = await getLojas();

  return (
    <div className="space-y-6">
      <DashboardCharts allObras={obras} allLojas={lojas} />
    </div>
  );
}
