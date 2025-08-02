import { KanbanBoard } from '@/components/obras/kanban-board';
import { NewObraDialog } from '@/components/obras/new-obra-dialog';
import { getObras, getUsers } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obras | JCR Radar',
};

export default async function ObrasPage() {
  const initialObras = await getObras();
  const sellers = await getUsers();

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.14)-2*theme(spacing.6))]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Quadro de Obras</h1>
        <NewObraDialog />
      </div>
      <div className="flex-1 overflow-x-auto">
        <KanbanBoard initialObras={initialObras} sellers={sellers} />
      </div>
    </div>
  );
}
