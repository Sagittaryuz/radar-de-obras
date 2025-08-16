
'use client';

import { useState, useEffect, useTransition } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja, Obra } from '@/lib/firestore-data';
import { getLojas } from '@/lib/firestore-data';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Textarea } from '../ui/textarea';

interface EditObraDialogProps {
  obra: Obra;
  onSuccess: () => void;
}

export function EditObraDialog({ obra, onSuccess }: EditObraDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lojas, setLojas] = useState<Loja[]>([]);
  
  const [formData, setFormData] = useState<Partial<Obra>>({});

  useEffect(() => {
    // When the dialog opens, initialize form data with the current obra data.
    if (open) {
      setFormData({
        street: obra.street || '',
        number: obra.number || '',
        neighborhood: obra.neighborhood || '',
        details: obra.details || '',
        lojaId: obra.lojaId || '',
        stage: obra.stage || '',
        // contacts and photos are not editable here for simplicity
      });

      const fetchLojas = async () => {
        const lojasData = await getLojas();
        setLojas(lojasData);
      };
      fetchLojas();
    }
  }, [open, obra]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: Partial<Obra> = { ...formData };
    
    // If address fields changed, update the full address string
    if (payload.street || payload.number || payload.neighborhood) {
        payload.address = `${payload.street || obra.street}, ${payload.number || obra.number}, ${payload.neighborhood || obra.neighborhood}`;
        payload.clientName = payload.address; // Also update clientName, which holds the address.
    }

    startTransition(async () => {
      try {
        const obraRef = doc(db, 'obras', obra.id);
        await updateDoc(obraRef, payload);
        
        toast({
            title: "Obra Atualizada",
            description: "Os dados da obra foram atualizados.",
        });
        setOpen(false);
        onSuccess();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        toast({
            variant: 'destructive',
            title: "Erro ao Atualizar",
            description: `Não foi possível atualizar. Detalhes: ${errorMessage}`,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Obra</DialogTitle>
          <DialogDescription>
            Modifique os dados da obra abaixo. Contatos e fotos não podem ser editados.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            
            <div className="grid grid-cols-3 gap-2">
              <div className='col-span-2'>
                <Label htmlFor="street">Rua</Label>
                <Input id="street" placeholder="Ex: Av. Brasil" value={formData.street} onChange={handleInputChange} />
              </div>
               <div>
                <Label htmlFor="number">N.º</Label>
                <Input id="number" placeholder="Ex: 123" value={formData.number} onChange={handleInputChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" placeholder="Ex: Centro" value={formData.neighborhood} onChange={handleInputChange} />
            </div>

             <div>
              <Label htmlFor="details">Detalhes</Label>
              <Textarea id="details" placeholder="Detalhes da obra" value={formData.details} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="lojaId">Unidade J. Cruzeiro</Label>
              <Select onValueChange={(value) => handleSelectChange('lojaId', value)} value={formData.lojaId}>
                  <SelectTrigger id="lojaId">
                      <SelectValue placeholder="Selecione a unidade responsável" />
                  </SelectTrigger>
                  <SelectContent>
                      {lojas.map(loja => (
                        <SelectItem key={loja.id} value={loja.id}>{loja.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stage">Etapa da Obra</Label>
              <Select onValueChange={(value) => handleSelectChange('stage', value)} value={formData.stage}>
                  <SelectTrigger id="stage">
                      <SelectValue placeholder="Selecione a etapa da obra" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Fundação">Fundação</SelectItem>
                      <SelectItem value="Alvenaria">Alvenaria</SelectItem>
                      <SelectItem value="Acabamento">Acabamento</SelectItem>
                      <SelectItem value="Pintura">Pintura</SelectItem>
                      <SelectItem value="Telhado">Telhado</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isPending}>
                    Cancelar
                </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
