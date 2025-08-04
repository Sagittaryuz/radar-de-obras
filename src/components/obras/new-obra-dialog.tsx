
'use client';

import { useState, useEffect } from 'react';
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
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface NewObraDialogProps {
  lojas: Loja[];
}

export function NewObraDialog({ lojas }: NewObraDialogProps) {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // States for form fields
  const [client, setClient] = useState('');
  const [phone, setPhone] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [unidade, setUnidade] = useState('');
  const [etapa, setEtapa] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  useEffect(() => {
    console.log('[NewObraDialog] Received lojas prop:', lojas); // Log para depuração
  }, [lojas]);

  const handleLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();

          if (data.address) {
            setRua(data.address.road || '');
            setBairro(data.address.suburb || data.address.city_district || '');
            toast({
              title: "Endereço Preenchido!",
              description: "A rua e o bairro foram preenchidos com base na sua localização.",
            });
          } else {
             toast({
              variant: 'destructive',
              title: "Endereço não encontrado",
              description: "Não foi possível encontrar um endereço para sua localização.",
            });
          }
        } catch (error) {
           toast({
            variant: 'destructive',
            title: "Erro ao buscar endereço",
            description: "Ocorreu um erro ao converter sua localização em endereço.",
          });
        } finally {
            setIsLocating(false);
        }
      },
      (error) => {
        toast({
          variant: 'destructive',
          title: "Erro de Localização",
          description: "Não foi possível obter sua localização. Verifique as permissões do navegador.",
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
        const newObra = {
            clientName: client,
            contactPhone: phone,
            street: rua,
            number: numero,
            neighborhood: bairro,
            address: `${rua}, ${numero}, ${bairro}`,
            lojaId: unidade,
            stage: etapa,
            status: 'Entrada', // Initial status
            sellerId: null,
            // photoUrl would be handled by an upload service in a real app
        };

        await addDoc(collection(db, 'obras'), newObra);

        toast({
            title: "Obra Criada",
            description: "A nova prospecção foi registrada com sucesso no Firestore.",
        });
        setOpen(false);
        router.refresh(); // Refresh the page to show the new obra
    } catch (e) {
        console.error("Error adding document: ", e);
        toast({
            variant: 'destructive',
            title: "Erro ao Salvar",
            description: "Não foi possível salvar a obra no banco de dados.",
        });
    }
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

            <div>
              <Label htmlFor="phone">Telefone de Contato</Label>
              <Input id="phone" placeholder="(XX) XXXXX-XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
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
                      {lojas && lojas.map(loja => (
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
