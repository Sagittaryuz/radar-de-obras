import { KanbanBoard } from '@/components/obras/kanban-board';
import { NewObraDialog } from '@/components/obras/new-obra-dialog';
import { getObras, getUsers, getLojas } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obras | JCR Radar',
};

export default async function ObrasPage() {
  const initialObras = await getObras();
  const sellers = await getUsers();
  const lojas = await getLojas();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Quadro de Obras</h1>
        <NewObraDialog lojas={lojas} />
      </div>
      <KanbanBoard initialObras={initialObras} sellers={sellers} />
    </div>
  );
}
