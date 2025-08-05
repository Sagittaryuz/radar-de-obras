
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
import { PlusCircle, MapPin, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja } from '@/lib/mock-data';
import { getLojas } from '@/lib/mock-data';
import { addObra } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function NewObraDialog() {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, startTransition] = useTransition();
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
  const [lojas, setLojas] = useState<Loja[]>([]);
  
  // State for photo preview and data
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');


  // Fetch Lojas when the dialog is about to open or is open
  useEffect(() => {
    if (open) {
      const fetchLojas = async () => {
        const lojasData = await getLojas();
        setLojas(lojasData);
      };
      fetchLojas();
    }
  }, [open]);

  const resetForm = () => {
    setClient('');
    setPhone('');
    setRua('');
    setNumero('');
    setBairro('');
    setUnidade('');
    setEtapa('');
    setPhotoPreview(null);
    setPhotoDataUrl('');
  };

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
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: `O tamanho máximo da foto é ${MAX_FILE_SIZE_MB}MB.`,
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setPhotoPreview(null);
    setPhotoDataUrl('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Add photo data to form data if it exists
    if (photoDataUrl) {
      formData.set('photoDataUrl', photoDataUrl);
    }

    startTransition(async () => {
      const result = await addObra(formData);
      if (result.success) {
        toast({
          title: "Obra Criada",
          description: result.message,
        });
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: "Erro ao Salvar",
          description: result.error || "Ocorreu um erro desconhecido.",
        });
      }
    });
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
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <Button type="button" variant="outline" className="w-full" onClick={handleLocation} disabled={isLocating}>
              <MapPin className="mr-2 h-4 w-4" />
              {isLocating ? 'Obtendo localização...' : 'Usar Localização Atual'}
            </Button>
            
            <div>
              <Label htmlFor="clientName">Cliente</Label>
              <Input id="clientName" name="clientName" placeholder="Nome do cliente ou construtora" required value={client} onChange={e => setClient(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="contactPhone">Telefone de Contato</Label>
              <Input id="contactPhone" name="contactPhone" placeholder="(XX) XXXXX-XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className='col-span-2'>
                <Label htmlFor="street">Rua</Label>
                <Input id="street" name="street" placeholder="Ex: Av. Brasil" required value={rua} onChange={e => setRua(e.target.value)} />
              </div>
               <div>
                <Label htmlFor="number">N.º</Label>
                <Input id="number" name="number" placeholder="Ex: 123" required value={numero} onChange={e => setNumero(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" name="neighborhood" placeholder="Ex: Centro" required value={bairro} onChange={e => setBairro(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="lojaId">Unidade J. Cruzeiro</Label>
              <Select required name="lojaId" onValueChange={setUnidade} value={unidade}>
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
              <Select required name="stage" onValueChange={setEtapa} value={etapa}>
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
              <Label htmlFor="photo">Foto da Fachada</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} />
            </div>

             {photoPreview && (
                <div className="relative w-fit">
                    <Image
                        src={photoPreview}
                        alt="Pré-visualização da imagem"
                        width={100}
                        height={100}
                        className="rounded-md object-cover aspect-square"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveFile}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
             )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSaving} onClick={resetForm}>
                    Cancelar
                </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
