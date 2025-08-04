
import { getObras, getLojas } from '@/lib/mock-data';
import { DashboardCharts } from '@/components/dashboard/charts';
import type { Obra, Loja } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | JCR Radar',
};

// This is now a Server Component. It fetches data on the server.
export default async function DashboardPage() {
  // Data is fetched on the server and passed to the client component.
  const obras = await getObras();
  const lojas = await getLojas();

  return (
    <div className="space-y-6">
      {/* The interactive chart component is now separate */}
      <DashboardCharts allObras={obras} allLojas={lojas} />
    </div>
  );
}
