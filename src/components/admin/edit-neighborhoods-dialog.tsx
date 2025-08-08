
'use client';

import { useState, useTransition } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


interface EditNeighborhoodsDialogProps {
  loja: Loja;
}

export function EditNeighborhoodsDialog({ loja }: EditNeighborhoodsDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [bairros, setBairros] = useState<string[]>(loja.neighborhoods);
  const [newBairro, setNewBairro] = useState('');
  const router = useRouter();

  const handleAddBairro = () => {
    if (newBairro && !bairros.includes(newBairro.trim())) {
      setBairros([...bairros, newBairro.trim()].sort());
      setNewBairro('');
    }
  };

  const handleRemoveBairro = (bairroToRemove: string) => {
    setBairros(bairros.filter(b => b !== bairroToRemove));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const lojaRef = doc(db, 'lojas', loja.id);
        await updateDoc(lojaRef, { neighborhoods: bairros });
        
        toast({
          title: "Sucesso!",
          description: `Bairros da ${loja.name} atualizados.`,
        });
        setOpen(false);
        router.refresh();
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
         toast({
          variant: 'destructive',
          title: "Erro",
          description: `Falha ao atualizar. Detalhes: ${errorMessage}`,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Editar Bairros</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Bairros de {loja.name}</DialogTitle>
          <DialogDescription>
            Adicione ou remova os bairros de atendimento para esta unidade.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Input 
                    value={newBairro}
                    onChange={(e) => setNewBairro(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBairro(); }}}
                    placeholder="Digite o nome do bairro"
                />
                <Button type="button" onClick={handleAddBairro}>Adicionar</Button>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">Bairros cadastrados:</p>
                <div className="flex flex-wrap gap-2 p-2 rounded-md border min-h-[5rem]">
                    {bairros.length > 0 ? bairros.map(bairro => (
                        <Badge key={bairro} variant="secondary" className="gap-1.5">
                            {bairro}
                            <button onClick={() => handleRemoveBairro(bairro)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )) : (
                        <p className="text-sm text-muted-foreground p-4 text-center w-full">Nenhum bairro adicionado.</p>
                    )}
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
              <Button type="button" variant="secondary">
                  Cancelar
              </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
