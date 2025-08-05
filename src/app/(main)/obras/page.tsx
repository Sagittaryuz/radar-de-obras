
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from '@/components/obras/kanban-board';
import { NewObraDialog } from '@/components/obras/new-obra-dialog';
import { getObras, getUsers, getLojas } from '@/lib/mock-data';
import type { Obra, User, Loja } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function ObrasPage() {
  const [initialObras, setInitialObras] = useState<Obra[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const initialLoja = searchParams.get('lojaId') || 'all';
  const initialStatus = searchParams.get('status') as Obra['status'] | null;
  const initialStage = searchParams.get('stage') as Obra['stage'] | null;

  const [selectedLoja, setSelectedLoja] = useState(initialLoja);
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [obrasData, sellersData, lojasData] = await Promise.all([
          getObras(),
          getUsers(),
          getLojas(),
        ]);
        setInitialObras(obrasData);
        setSellers(sellersData);
        setLojas(lojasData);
      } catch (error) {
        console.error("Failed to fetch obras page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredObras = useMemo(() => {
    let obras = initialObras;
    if (selectedLoja !== 'all') {
      obras = obras.filter(obra => obra.lojaId === selectedLoja);
    }
    if (initialStatus) {
        obras = obras.filter(obra => obra.status === initialStatus);
    }
    if (initialStage) {
        obras = obras.filter(obra => obra.stage === initialStage);
    }
    return obras;
  }, [initialObras, selectedLoja, initialStatus, initialStage]);
  
  // Set default tab on Kanban board if status is provided
  const defaultKanbanTab = initialStatus || undefined;

  if (loading) {
     return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32 ml-auto" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Quadro de Obras</h1>
            <div className="w-full max-w-xs">
               <Select value={selectedLoja} onValueChange={setSelectedLoja}>
                  <SelectTrigger>
                      <SelectValue placeholder="Filtrar por unidade..." />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas as Unidades</SelectItem>
                      {lojas.map(loja => (
                          <SelectItem key={loja.id} value={loja.id}>{loja.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
        </div>
        <NewObraDialog />
      </div>
      <KanbanBoard obras={filteredObras} sellers={sellers} defaultTab={defaultKanbanTab} />
    </div>
  );
}
