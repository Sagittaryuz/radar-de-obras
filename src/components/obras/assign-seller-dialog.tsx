
'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja, Obra, User } from '@/lib/firestore-data';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface AssignSellerDialogProps {
  obra: Obra;
  vendedores: User[];
  obras: Obra[];
  onSuccess: () => void;
}

function getInitials(name: string) {
    if (!name) return '...';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}

export function AssignSellerDialog({ obra, vendedores, obras, onSuccess }: AssignSellerDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>(undefined);

  const sellerObrasCount = useMemo(() => {
    return vendedores.reduce((acc, vendedor) => {
        acc[vendedor.id] = obras.filter(o => o.sellerId === vendedor.id).length;
        return acc;
    }, {} as Record<string, number>)
  }, [vendedores, obras]);


  const handleSubmit = async () => {
    if (!selectedSellerId) {
      toast({
        variant: 'destructive',
        title: 'Nenhum vendedor selecionado',
        description: 'Por favor, selecione um vendedor para atribuir a obra.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const obraRef = doc(db, 'obras', obra.id);
        await updateDoc(obraRef, { 
            sellerId: selectedSellerId,
            status: 'Atribuída'
        });
        
        toast({
            title: "Obra Atribuída",
            description: "A obra foi atribuída ao vendedor e movida para a coluna 'Atribuída'.",
        });
        setOpen(false);
        onSuccess();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        toast({
            variant: 'destructive',
            title: "Erro ao Atribuir",
            description: `Não foi possível atribuir a obra. Detalhes: ${errorMessage}`,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Atribuir Vendedor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Atribuir Obra</DialogTitle>
          <DialogDescription>
            Selecione um vendedor da sua unidade para ser o responsável por esta obra.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
            {vendedores.length > 0 ? (
                <RadioGroup onValueChange={setSelectedSellerId} value={selectedSellerId}>
                    <div className="space-y-2">
                        {vendedores.map(vendedor => (
                            <Label key={vendedor.id} htmlFor={vendedor.id} className="flex items-center justify-between p-3 rounded-md border has-[input:checked]:bg-muted has-[input:checked]:border-primary cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={vendedor.avatar} alt={vendedor.name} />
                                        <AvatarFallback>{getInitials(vendedor.name)}</AvatarFallback>
                                    </Avatar>
                                    <span>{vendedor.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {sellerObrasCount[vendedor.id] ?? 0} obras
                                    </span>
                                    <RadioGroupItem value={vendedor.id} id={vendedor.id} />
                                </div>
                            </Label>
                        ))}
                    </div>
                </RadioGroup>
            ) : (
                <p className="text-center text-muted-foreground p-4">Nenhum vendedor encontrado para esta unidade.</p>
            )}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isPending}>
                    Cancelar
                </Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isPending || !selectedSellerId}>
                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Atribuir Obra
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
