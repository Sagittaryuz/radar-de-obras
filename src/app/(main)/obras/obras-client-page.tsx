
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from '@/components/obras/kanban-board';
import { NewObraDialog } from '@/components/obras/new-obra-dialog';
import { getObras, getUsers, getLojas } from '@/lib/firestore-data';
import type { Obra, User, Loja } from '@/lib/firestore-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PdfExportButton } from '@/components/obras/pdf-export-button';
import { Timestamp } from 'firebase/firestore';


export default function ObrasClientPage() {
  const [initialObras, setInitialObras] = useState<Obra[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const initialLoja = searchParams.get('lojaId') || 'all';
  const initialStatus = searchParams.get('status') as Obra['status'] | null;
  const initialStage = searchParams.get('stage') as Obra['stage'] | null;

  const [selectedLoja, setSelectedLoja] = useState(initialLoja);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  

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
    if (dateRange?.from && dateRange?.to) {
        obras = obras.filter(obra => {
            if (!obra.createdAt) return false;
            
            let obraDate: Date;
            if (obra.createdAt instanceof Timestamp) {
                obraDate = obra.createdAt.toDate();
            } else {
                obraDate = new Date(obra.createdAt);
            }

            // Adjust to the end of the selected day
            const toDate = new Date(dateRange.to!);
            toDate.setHours(23, 59, 59, 999);
            return obraDate >= dateRange.from! && obraDate <= toDate;
        });
    }
    return obras;
  }, [initialObras, selectedLoja, initialStatus, initialStage, dateRange]);
  
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Quadro de Obras</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="w-full sm:w-52">
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
              <div className="w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Selecione um período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <PdfExportButton obras={filteredObras} />
            <div className="w-full md:w-auto">
              <NewObraDialog />
            </div>
        </div>
      </div>
      <KanbanBoard obras={filteredObras} sellers={sellers} defaultTab={defaultKanbanTab} />
    </div>
  );
}
