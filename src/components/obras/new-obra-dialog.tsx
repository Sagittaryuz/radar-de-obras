
'use client';

import { useState } from 'react';
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
import { PlusCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja } from '@/lib/mock-data';

interface NewObraDialogProps {
  lojas: Loja[];
}

export function NewObraDialog({ lojas }: NewObraDialogProps) {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [open, setOpen] = useState(false);

  // States for form fields
  const [client, setClient] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [unidade, setUnidade] = useState('');
  const [etapa, setEtapa] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  const handleLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Mocking address based on location for demonstration
        toast({
          title: "Localização Obtida!",
          description: "Você pode preencher o endereço manualmente.",
        });
        setIsLocating(false);
      },
      (error) => {
        toast({
          variant: 'destructive',
          title: "Erro de Localização",
          description: "Não foi possível obter sua localização.",
        });
        console.error("Geolocation Error:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFoto(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, you would handle form submission to the server here.
    toast({
        title: "Obra Criada",
        description: "A nova prospecção foi registrada com sucesso.",
    });
    setOpen(false); // Close dialog on submit
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Obra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Nova Prospecção de Obra</DialogTitle>
          <DialogDescription>
            Preencha os dados para registrar uma nova obra.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Button type="button" variant="outline" className="w-full" onClick={handleLocation} disabled={isLocating}>
              <MapPin className="mr-2 h-4 w-4" />
              {isLocating ? 'Obtendo localização...' : 'Usar Localização Atual'}
            </Button>
            
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Input id="client" placeholder="Nome do cliente ou construtora" required value={client} onChange={e => setClient(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className='col-span-2'>
                <Label htmlFor="rua">Rua</Label>
                <Input id="rua" placeholder="Ex: Av. Brasil" required value={rua} onChange={e => setRua(e.target.value)} />
              </div>
               <div>
                <Label htmlFor="numero">N.º</Label>
                <Input id="numero" placeholder="Ex: 123" required value={numero} onChange={e => setNumero(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" placeholder="Ex: Centro" required value={bairro} onChange={e => setBairro(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="unidade">Unidade J. Cruzeiro</Label>
              <Select required onValueChange={setUnidade} value={unidade}>
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
              <Select required onValueChange={setEtapa} value={etapa}>
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

            <div>
              <Label htmlFor="foto">Foto da Fachada</Label>
              <Input id="foto" type="file" accept="image/*" onChange={handleFileChange} />
            </div>

          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Cancelar
                </Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
