
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
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const [fotos, setFotos] = useState<File[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Fetch Lojas when the dialog is about to open or is open
  useEffect(() => {
    if (open) {
      const fetchLojas = async () => {
        const lojasData = await getLojas();
        setLojas(lojasData);
      };
      fetchLojas();
    }
     // Cleanup previews on unmount
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [open]);

  useEffect(() => {
    // Create previews whenever 'fotos' state changes
    const newPreviews = fotos.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Cleanup function
    return () => {
      newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [fotos]);


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
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFotos(prevFotos => [...prevFotos, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFotos(prevFotos => prevFotos.filter((_, i) => i !== index));
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
        try {
            // 1. Upload photos to Firebase Storage
            const photoUrls = await Promise.all(
                fotos.map(async (file) => {
                    const storageRef = ref(storage, `obras/${Date.now()}-${file.name}`);
                    await uploadBytes(storageRef, file);
                    const downloadURL = await getDownloadURL(storageRef);
                    return downloadURL;
                })
            );

            // 2. Create obra document data
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
                photoUrls: photoUrls, // Add the array of photo URLs
            };

            // 3. Save to Firestore
            await addDoc(collection(db, 'obras'), newObra);

            toast({
                title: "Obra Criada",
                description: "A nova prospecção foi registrada com sucesso.",
            });
            setOpen(false);
            router.refresh(); // Refresh the page to show the new obra
        } catch (e) {
            console.error("Error adding document: ", e);
            toast({
                variant: 'destructive',
                title: "Erro ao Salvar",
                description: "Não foi possível salvar a obra. Verifique o console para mais detalhes.",
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
              <Label htmlFor="fotos">Fotos da Fachada</Label>
              <Input id="fotos" type="file" accept="image/*" multiple onChange={handleFileChange} />
            </div>

             {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative">
                            <Image
                                src={preview}
                                alt={`Pré-visualização da imagem ${index + 1}`}
                                width={100}
                                height={100}
                                className="rounded-md object-cover aspect-square"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => handleRemoveFile(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
             )}


          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSaving}>
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
