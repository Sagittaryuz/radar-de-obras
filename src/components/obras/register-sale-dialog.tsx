
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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar as CalendarIcon, Trash2, Edit, PlusCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Obra, Sale } from '@/lib/firestore-data';
import { doc, updateDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '../ui/scroll-area';

interface RegisterSaleDialogProps {
  obra: Obra;
  onSuccess: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function RegisterSaleDialog({ obra, onSuccess, children }: PropsWithChildren<RegisterSaleDialogProps>) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // State for the form to add/edit a sale
  const [currentSale, setCurrentSale] = useState<Partial<Sale> | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [saleDate, setSaleDate] = useState<Date | undefined>(new Date());
  
  // State to manage the list of sales
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (open) {
      setSales(obra.sales || []);
    } else {
      // Reset everything on close
      setSales([]);
      setCurrentSale(null);
      resetForm();
    }
  }, [open, obra.sales]);

  const resetForm = () => {
    setOrderNumber('');
    setSaleValue('');
    setSaleDate(new Date());
  };

  const handleAddNew = () => {
    setCurrentSale({}); // Set an empty object to signify a new sale
    resetForm();
  };

  const handleEdit = (sale: Sale) => {
    setCurrentSale(sale);
    setOrderNumber(sale.orderNumber || '');
    setSaleValue(sale.value.toString());
    setSaleDate(sale.date.toDate());
  };

  const handleCancelEdit = () => {
    setCurrentSale(null);
    resetForm();
  };

  const handleDelete = (saleToDelete: Sale) => {
     startTransition(async () => {
        try {
            const obraRef = doc(db, 'obras', obra.id);
            await updateDoc(obraRef, {
                sales: arrayRemove(saleToDelete)
            });
            toast({ title: "Venda Removida", description: "A venda foi removida com sucesso." });
            onSuccess(); // This will refetch data and update the dialog state via useEffect
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro ao Remover", description: "Não foi possível remover a venda." });
        }
     });
  };

  const handleSave = () => {
    const numericSaleValue = parseFloat(saleValue.replace(',', '.'));

    if (isNaN(numericSaleValue) || numericSaleValue <= 0) {
      toast({ variant: 'destructive', title: 'Valor Inválido', description: 'Por favor, insira um valor de venda numérico e positivo.' });
      return;
    }
    
    if (!saleDate) {
        toast({ variant: 'destructive', title: 'Data Inválida', description: 'Por favor, selecione a data da venda.' });
        return;
    }

    startTransition(async () => {
      try {
        const obraRef = doc(db, 'obras', obra.id);
        const isEditing = !!(currentSale && currentSale.id);

        if (isEditing) {
            // To edit an item in an array, we must remove the old one and add the new one.
            const oldSale = currentSale as Sale;
            const newSale: Sale = { ...oldSale, orderNumber, value: numericSaleValue, date: Timestamp.fromDate(saleDate) };
            
            const batch = doc(db).firestore.batch();
            batch.update(obraRef, { sales: arrayRemove(oldSale) });
            batch.update(obraRef, { sales: arrayUnion(newSale) });

            await batch.commit();

        } else {
            // Adding a new sale
            const newSale: Sale = { 
                id: `sale_${Date.now()}`, // Simple unique ID
                orderNumber, 
                value: numericSaleValue, 
                date: Timestamp.fromDate(saleDate) 
            };
            await updateDoc(obraRef, {
                sales: arrayUnion(newSale),
                status: 'Ganha' // Set status to 'Ganha' on first sale
            });
        }
        
        toast({ title: "Sucesso!", description: `A venda foi ${isEditing ? 'atualizada' : 'registrada'}.` });
        onSuccess();
        setCurrentSale(null); // Go back to the list view
        resetForm();
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
         toast({ variant: 'destructive', title: "Erro ao Salvar", description: `Não foi possível salvar a venda. Detalhes: ${errorMessage}`});
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Gerenciar Vendas da Obra</DialogTitle>
          <DialogDescription>
            {currentSale ? 'Preencha os dados para adicionar ou editar a venda.' : 'Veja, adicione ou edite as vendas registradas para esta obra.'}
          </DialogDescription>
        </DialogHeader>

        {currentSale ? (
          // Form View (Add/Edit)
          <div className="space-y-4 py-4">
              <div>
                  <Label htmlFor="orderNumber">N.º do Pedido</Label>
                  <Input id="orderNumber" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Ex: PED12345" />
              </div>
              <div>
                  <Label htmlFor="saleValue">Valor da Venda (R$)</Label>
                  <Input id="saleValue" value={saleValue} onChange={(e) => setSaleValue(e.target.value)} placeholder="Ex: 1500,50" type="text" inputMode="decimal" />
              </div>
              <div>
                  <Label htmlFor="saleDate">Data da Venda</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="saleDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !saleDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {saleDate ? format(saleDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={saleDate} onSelect={setSaleDate} initialFocus /></PopoverContent>
                  </Popover>
              </div>
          </div>
        ) : (
           // List View
           <ScrollArea className="max-h-80 pr-4">
                <div className="space-y-3 py-4">
                    {sales.length > 0 ? (
                        sales.map(sale => (
                            <div key={sale.id} className="relative flex items-center justify-between p-3 rounded-md border">
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(sale)} disabled={isPending}>
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Excluir Venda</span>
                                </Button>
                                <div>
                                    <p className="font-semibold">{formatCurrency(sale.value)}</p>
                                    <p className="text-sm text-muted-foreground">{sale.orderNumber || 'Sem pedido'}</p>
                                    <p className="text-xs text-muted-foreground">{format(sale.date.toDate(), 'dd/MM/yyyy', { locale: ptBR })}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)} disabled={isPending}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">Nenhuma venda registrada.</p>
                    )}
                </div>
            </ScrollArea>
        )}

        <DialogFooter>
          {currentSale ? (
            <>
              <Button type="button" variant="secondary" onClick={handleCancelEdit} disabled={isPending}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Venda
              </Button>
            </>
          ) : (
            <Button onClick={handleAddNew} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Nova Venda
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
