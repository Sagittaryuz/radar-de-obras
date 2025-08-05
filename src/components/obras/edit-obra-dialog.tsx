
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
import type { Loja, Obra } from '@/lib/mock-data';
import { getLojas } from '@/lib/mock-data';
import { updateObra } from '@/lib/actions';

interface EditObraDialogProps {
  obra: Obra;
  onObraUpdated: (updatedObra: Obra) => void;
}

export function EditObraDialog({ obra, onObraUpdated }: EditObraDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lojas, setLojas] = useState<Loja[]>([]);
  
  // Initialize form state directly from the obra prop.
  // This state will now be the single source of truth for the form.
  const [formData, setFormData] = useState({
    clientName: obra.clientName || '',
    contactPhone: obra.contactPhone || '',
    street: obra.street || '',
    number: obra.number || '',
    neighborhood: obra.neighborhood || '',
    lojaId: obra.lojaId || '',
    stage: obra.stage || '',
  });

  // When the dialog opens, fetch the necessary data (lojas) and reset the form
  // state to match the current `obra` prop. This ensures the form is always
  // fresh when it's opened.
  useEffect(() => {
    if (open) {
      setFormData({
        clientName: obra.clientName || '',
        contactPhone: obra.contactPhone || '',
        street: obra.street || '',
        number: obra.number || '',
        neighborhood: obra.neighborhood || '',
        lojaId: obra.lojaId || '',
        stage: obra.stage || '',
      });

      const fetchLojas = async () => {
        const lojasData = await getLojas();
        setLojas(lojasData);
      };
      fetchLojas();
    }
  }, [open, obra]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('[EditDialog] handleSubmit triggered.');

    // The server action will handle the comparison logic. We send the whole form data.
    const payload: Partial<Obra> = {
        clientName: formData.clientName,
        contactPhone: formData.contactPhone,
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        lojaId: formData.lojaId,
        stage: formData.stage as Obra['stage'],
    };

    startTransition(async () => {
        console.log('[EditDialog] Submitting payload to server action:', payload);
        const result = await updateObra(obra.id, payload);

        if (result.success && result.data) {
            toast({
                title: "Obra Atualizada",
                description: result.message || "Os dados da obra foram atualizados.",
            });
            onObraUpdated(result.data);
            setOpen(false);
        } else {
            toast({
                variant: 'destructive',
                title: "Erro ao Atualizar",
                description: result.error,
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
            Modifique os dados da obra abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div>
              <Label htmlFor="clientName">Cliente</Label>
              <Input id="clientName" placeholder="Nome do cliente ou construtora" value={formData.clientName} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="contactPhone">Telefone de Contato</Label>
              <Input id="contactPhone" placeholder="(XX) XXXXX-XXXX" value={formData.contactPhone} onChange={handleInputChange} />
            </div>

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
