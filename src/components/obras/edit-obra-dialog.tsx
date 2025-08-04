
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

  // States for form fields, initialized with obra data
  const [client, setClient] = useState(obra.clientName);
  const [phone, setPhone] = useState(obra.contactPhone || '');
  const [rua, setRua] = useState(obra.street);
  const [numero, setNumero] = useState(obra.number);
  const [bairro, setBairro] = useState(obra.neighborhood);
  const [unidade, setUnidade] = useState(obra.lojaId);
  const [etapa, setEtapa] = useState(obra.stage);
  const [lojas, setLojas] = useState<Loja[]>([]);

  useEffect(() => {
    if (open) {
      const fetchLojas = async () => {
        const lojasData = await getLojas();
        setLojas(lojasData);
      };
      fetchLojas();
    }
  }, [open]);
  
  // Reset form state when obra prop changes or dialog opens
  useEffect(() => {
    if (obra) {
        setClient(obra.clientName);
        setPhone(obra.contactPhone || '');
        setRua(obra.street);
        setNumero(obra.number);
        setBairro(obra.neighborhood);
        setUnidade(obra.lojaId);
        setEtapa(obra.stage);
    }
  }, [obra, open]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
        const updatedData: Partial<Obra> = {};

        if (client !== obra.clientName) updatedData.clientName = client;
        if (phone !== (obra.contactPhone || '')) updatedData.contactPhone = phone;
        if (rua !== obra.street) updatedData.street = rua;
        if (numero !== obra.number) updatedData.number = numero;
        if (bairro !== obra.neighborhood) updatedData.neighborhood = bairro;
        if (unidade !== obra.lojaId) updatedData.lojaId = unidade;
        if (etapa !== obra.stage) updatedData.stage = etapa;
        
        if (Object.keys(updatedData).length === 0) {
            toast({
                title: "Nenhuma Alteração",
                description: "Nenhuma informação foi modificada.",
            });
            return;
        }


        const result = await updateObra(obra.id, updatedData);

        if (result.success && result.data) {
            toast({
                title: "Obra Atualizada",
                description: "Os dados da obra foram atualizados com sucesso.",
            });
            // Pass the full updated obra from the server back to the page
            onObraUpdated(result.data as Obra);
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
              <Input id="client" placeholder="Nome do cliente ou construtora" required value={client} onChange={e => setClient(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="phone">Telefone de Contato</Label>
              <Input id="phone" placeholder="(XX) XXXXX-XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className='col-span-2'>
                <Label htmlFor="rua">Rua</Label>
                <Input id="rua" placeholder="Ex: Av. Brasil" value={rua} onChange={e => setRua(e.target.value)} />
              </div>
               <div>
                <Label htmlFor="numero">N.º</Label>
                <Input id="numero" placeholder="Ex: 123" value={numero} onChange={e => setNumero(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" placeholder="Ex: Centro" value={bairro} onChange={e => setBairro(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="unidade">Unidade J. Cruzeiro</Label>
              <Select onValueChange={setUnidade} value={unidade}>
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
              <Label htmlFor="stage">Etapa da Obra</Label>
              <Select onValueChange={setEtapa} value={etapa}>
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
                <Button type="button" variant="secondary">
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
