'use client';

import { useState, useMemo, DragEvent } from 'react';
import type { Obra, User } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type KanbanBoardProps = {
  initialObras: Obra[];
  sellers: User[];
};

const columns = ['Entrada', 'Triagem', 'Atribuída', 'Em Negociação', 'Ganha', 'Perdida'] as const;
type Status = typeof columns[number];

function getInitials(name: string) {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}

export function KanbanBoard({ initialObras, sellers }: KanbanBoardProps) {
  const [obras, setObras] = useState<Obra[]>(initialObras);
  const [draggedItem, setDraggedItem] = useState<Obra | null>(null);

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

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (draggedItem) {
      setObras(prevObras =>
        prevObras.map(obra =>
          obra.id === draggedItem.id ? { ...obra, status } : obra
        )
      );
      setDraggedItem(null);
    }
  };

  return (
    <div className="flex gap-4 pb-4 min-w-max">
      {columns.map(status => (
        <div
          key={status}
          className="w-72 flex-shrink-0"
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, status)}
        >
          <Card className="bg-muted/50 h-full">
            <CardHeader className='pb-4'>
              <CardTitle className="font-headline text-lg">{status}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {obras
                .filter(obra => obra.status === status)
                .map(obra => {
                  const seller = obra.sellerId ? sellerMap[obra.sellerId] : null;
                  return (
                    <Card
                      key={obra.id}
                      draggable
                      onDragStart={e => handleDragStart(e, obra)}
                      className={cn(
                        "shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
                        draggedItem?.id === obra.id && "opacity-50"
                      )}
                    >
                      <CardContent className="p-4 space-y-2">
                        <p className="font-bold">{obra.clientName}</p>
                        <p className="text-sm text-muted-foreground">{obra.address}</p>
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
                  );
                })}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
