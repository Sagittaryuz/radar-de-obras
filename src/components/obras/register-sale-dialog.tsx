
'use client';

import { useState, useEffect, useTransition, type PropsWithChildren } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Obra } from '@/lib/firestore-data';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RegisterSaleDialogProps {
  obra: Obra;
  onSuccess: () => void;
}

export function RegisterSaleDialog({ obra, onSuccess, children }: PropsWithChildren<RegisterSaleDialogProps>) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [orderNumber, setOrderNumber] = useState('');
  const [saleValue, setSaleValue] = useState('');

  const isEditing = !!obra.closedValue;

  useEffect(() => {
    if (open && isEditing) {
      setOrderNumber(obra.orderNumber || '');
      setSaleValue(obra.closedValue?.toString() || '');
    }
    if (!open) {
      // Reset form on close
      setOrderNumber('');
      setSaleValue('');
    }
  }, [open, isEditing, obra]);

  const handleSave = () => {
    const numericSaleValue = parseFloat(saleValue.replace(',', '.'));

    if (isNaN(numericSaleValue) || numericSaleValue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valor Inválido',
        description: 'Por favor, insira um valor de venda numérico e positivo.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const obraRef = doc(db, 'obras', obra.id);
        await updateDoc(obraRef, {
          orderNumber: orderNumber,
          closedValue: numericSaleValue,
          closedAt: serverTimestamp(),
          status: 'Ganha' // Automatically set status to 'Ganha'
        });
        
        toast({
          title: "Sucesso!",
          description: `A venda foi ${isEditing ? 'atualizada' : 'registrada'} com sucesso.`,
        });
        setOpen(false);
        onSuccess();
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
         toast({
          variant: 'destructive',
          title: "Erro ao Salvar",
          description: `Não foi possível salvar a venda. Detalhes: ${errorMessage}`,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditing ? 'Editar' : 'Registrar'} Venda</DialogTitle>
          <DialogDescription>
            Insira os detalhes da venda para a obra. O status será atualizado para "Ganha".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <Label htmlFor="orderNumber">N.º do Pedido</Label>
                <Input 
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Ex: PED12345"
                />
            </div>
             <div>
                <Label htmlFor="saleValue">Valor da Venda (R$)</Label>
                <Input 
                    id="saleValue"
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value)}
                    placeholder="Ex: 1500,50"
                    type="text"
                    inputMode="decimal"
                />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isPending}>
                  Cancelar
              </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
