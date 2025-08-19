
'use client';

import { useState, useMemo, DragEvent, useEffect } from 'react';
import type { Obra, User } from '@/lib/firestore-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ObraDeadlineBadge } from './obra-deadline-badge';

type KanbanBoardProps = {
  obras: Obra[];
  sellers: User[];
  defaultTab?: string;
};

const columns = ['Entrada', 'Triagem', 'Atribuída', 'Em Negociação', 'Ganha', 'Perdida', 'Arquivada'] as const;
type Status = typeof columns[number];

function getInitials(name: string) {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}

function formatCreationDate(date: string | Timestamp | undefined): string {
    if (!date) return 'Data desconhecida';
    let d: Date;
    if (date instanceof Timestamp) {
        d = date.toDate();
    } else {
        d = new Date(date);
    }
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function KanbanBoard({ obras: obrasProp, sellers, defaultTab }: KanbanBoardProps) {
  const [obras, setObras] = useState<Obra[]>(obrasProp);
  const [draggedItem, setDraggedItem] = useState<Obra | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setObras(obrasProp);
  }, [obrasProp]);

  const sellerMap = useMemo(() => {
    return sellers.reduce((acc, seller) => {
      acc[seller.id] = seller;
      return acc;
    }, {} as Record<string, User>);
  }, [sellers]);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, obra: Obra) => {
    // Prevent dragging based on user role
    if (user?.role === 'Vendedor') {
        toast({
            variant: 'destructive',
            title: 'Ação não permitida',
            description: 'Vendedores não podem alterar o status das obras.',
        });
        e.preventDefault();
        return;
    }
    setDraggedItem(obra);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== status) {
      const originalObras = obras;
      const updatedClientName = (draggedItem.contacts && draggedItem.contacts.length > 0 && draggedItem.contacts[0].name) ? draggedItem.contacts[0].name : draggedItem.clientName;
      // Optimistic update
      setObras(prevObras =>
        prevObras.map(obra =>
          obra.id === draggedItem.id ? { ...obra, status } : obra
        )
      );
      
      try {
        const obraRef = doc(db, 'obras', draggedItem.id);
        await updateDoc(obraRef, { status });
        toast({
          title: "Status Atualizado!",
          description: `A obra de "${updatedClientName}" foi movida para ${status}.`,
        });
      } catch (error) {
        console.error("Failed to update status:", error);
        setObras(originalObras);
        toast({
          variant: 'destructive',
          title: "Erro ao Atualizar",
          description: "Não foi possível atualizar o status da obra. Tente novamente.",
        });
      } finally {
        setDraggedItem(null);
      }
    } else {
        setDraggedItem(null);
    }
  };

  return (
    <Tabs defaultValue={defaultTab || columns[0]} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="grid w-full grid-cols-7 min-w-[700px]">
                {columns.map(status => (
                <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
                ))}
            </TabsList>
        </ScrollArea>
      {columns.map(status => (
        <TabsContent 
          key={status} 
          value={status}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, status)}
          className="mt-4 min-h-[400px] rounded-md border border-dashed border-border p-4"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {obras
              .filter(obra => obra.status === status)
              .map(obra => {
                const seller = obra.sellerId ? sellerMap[obra.sellerId] : null;
                const coverPhoto = obra.photoUrls && obra.photoUrls.length > 0 ? obra.photoUrls[0] : null;
                const cardTitle = (obra.contacts && obra.contacts.length > 0 && obra.contacts[0].name) ? obra.contacts[0].name : obra.clientName;

                return (
                  <Link key={obra.id} href={`/obras/${obra.id}`} passHref>
                    <div
                      draggable
                      onDragStart={e => handleDragStart(e, obra)}
                      className="h-full"
                    >
                      <Card
                        className={cn(
                          "shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing h-full overflow-hidden flex flex-col group",
                          draggedItem?.id === obra.id && "opacity-50"
                        )}
                      >
                         {coverPhoto ? (
                            <div className="relative aspect-video w-full">
                                <Image 
                                    src={coverPhoto} 
                                    alt={`Foto da obra de ${cardTitle}`}
                                    fill
                                    className="object-cover"
                                    quality={50}
                                />
                            </div>
                         ) : (
                            <div className="flex aspect-video w-full items-center justify-center bg-muted">
                                <Building2 className="h-10 w-10 text-muted-foreground" />
                            </div>
                         )}
                         <CardHeader className="p-4 pb-2">
                             {user?.role === 'Gerente' && obra.status === 'Triagem' && obra.createdAt && (
                                <ObraDeadlineBadge createdAt={obra.createdAt} />
                             )}
                             <p className="font-bold truncate" title={cardTitle}>{cardTitle}</p>
                         </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2 flex flex-col flex-grow justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground truncate" title={obra.address}>{obra.address}</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatCreationDate(obra.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{obra.stage}</span>
                            {seller && (
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={seller.avatar} />
                                <AvatarFallback>{getInitials(seller.name)}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                );
              })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
