
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

  const [formData, setFormData] = useState({
      client: '',
      phone: '',
      rua: '',
      numero: '',
      bairro: '',
      unidade: '',
      etapa: '',
  });

  const [lojas, setLojas] = useState<Loja[]>([]);

  useEffect(() => {
    if (obra) {
        setFormData({
            client: obra.clientName || '',
            phone: obra.contactPhone || '',
            rua: obra.street || '',
            numero: obra.number || '',
            bairro: obra.neighborhood || '',
            unidade: obra.lojaId || '',
            etapa: obra.stage || '',
        });
    }

    if (open) {
      const fetchLojas = async () => {
        const lojasData = await getLojas();
        setLojas(lojasData);
      };
      fetchLojas();
    }
  }, [obra, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const payload: Partial<Obra> = {
        clientName: formData.client,
        contactPhone: formData.phone,
        street: formData.rua,
        number: formData.numero,
        neighborhood: formData.bairro,
        lojaId: formData.unidade,
        stage: formData.etapa as Obra['stage'],
    };

    console.log('[EditDialog] Submitting payload to server action:', payload);

    startTransition(async () => {
      const result = await updateObra(obra.id, payload);

      if (result.success && result.data) {
        toast({
          title: "Obra Atualizada",
          description: result.message,
        });
        onObraUpdated(result.data); // Update the state on the detail page
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
              <Label htmlFor="client">Cliente</Label>
              <Input id="client" placeholder="Nome do cliente ou construtora" value={formData.client} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="phone">Telefone de Contato</Label>
              <Input id="phone" placeholder="(XX) XXXXX-XXXX" value={formData.phone} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className='col-span-2'>
                <Label htmlFor="rua">Rua</Label>
                <Input id="rua" placeholder="Ex: Av. Brasil" value={formData.rua} onChange={handleInputChange} />
              </div>
               <div>
                <Label htmlFor="numero">N.º</Label>
                <Input id="numero" placeholder="Ex: 123" value={formData.numero} onChange={handleInputChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" placeholder="Ex: Centro" value={formData.bairro} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="unidade">Unidade J. Cruzeiro</Label>
              <Select onValueChange={(value) => handleSelectChange('unidade', value)} value={formData.unidade}>
                  <SelectTrigger id="unidade">
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
              <Label htmlFor="etapa">Etapa da Obra</Label>
              <Select onValueChange={(value) => handleSelectChange('etapa', value)} value={formData.etapa}>
                  <SelectTrigger id="etapa">
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
