
'use client';

import { useState, useMemo, DragEvent, useEffect } from 'react';
import type { Obra, User } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';


type KanbanBoardProps = {
  obras: Obra[];
  sellers: User[];
  defaultTab?: string;
};

const columns = ['Entrada', 'Triagem', 'Atribuída', 'Em Negociação', 'Ganha', 'Perdida'] as const;
type Status = typeof columns[number];

function getInitials(name: string) {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}

export function KanbanBoard({ obras: obrasProp, sellers, defaultTab }: KanbanBoardProps) {
  const [obras, setObras] = useState<Obra[]>(obrasProp);
  const [draggedItem, setDraggedItem] = useState<Obra | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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
          description: `A obra "${draggedItem.clientName}" foi movida para ${status}.`,
        });
        // router.refresh(); // Optional: uncomment if you want to re-fetch all data
      } catch (error) {
        console.error("Failed to update status:", error);
        // Rollback on error
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
      <TabsList className="grid w-full grid-cols-6">
        {columns.map(status => (
          <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
        ))}
      </TabsList>
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
                return (
                  <Link key={obra.id} href={`/obras/${obra.id}`} passHref>
                    <div
                      draggable
                      onDragStart={e => handleDragStart(e, obra)}
                      className="h-full"
                    >
                      <Card
                        className={cn(
                          "shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing h-full overflow-hidden",
                          draggedItem?.id === obra.id && "opacity-50"
                        )}
                      >
                         {coverPhoto ? (
                            <div className="relative aspect-video w-full">
                                <Image 
                                    src={coverPhoto} 
                                    alt={`Foto da obra de ${obra.clientName}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                         ) : (
                            <div className="flex aspect-video w-full items-center justify-center bg-muted">
                                <Building2 className="h-10 w-10 text-muted-foreground" />
                            </div>
                         )}
                        <CardContent className="p-4 space-y-2 flex flex-col justify-between">
                          <div>
                            <p className="font-bold truncate">{obra.clientName}</p>
                            <p className="text-sm text-muted-foreground truncate">{obra.address}</p>
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
