
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [selectedLoja, setSelectedLoja] = useState('all');

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
    if (selectedLoja === 'all') {
      return initialObras;
    }
    return initialObras.filter(obra => obra.lojaId === selectedLoja);
  }, [initialObras, selectedLoja]);

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
      <KanbanBoard obras={filteredObras} sellers={sellers} />
    </div>
  );
}
