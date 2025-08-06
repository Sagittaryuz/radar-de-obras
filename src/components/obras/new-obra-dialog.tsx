
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
import { PlusCircle, MapPin, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja, ObraContact, ContactType } from '@/lib/mock-data';
import { getLojas } from '@/lib/mock-data';
import { addObra } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Textarea } from '../ui/textarea';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const contactTypes: ContactType[] = [
  'Dono da obra',
  'Mestre de Obras',
  'Engenheiro/Arquiteto',
  'Pedreiro',
  'Pintor',
  'Eletricista',
  'Encanador',
  'Gesseiro',
  'Carpinteiro',
  'Marceneiro',
];

export function NewObraDialog() {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // States for form fields
  const [details, setDetails] = useState('');
  const [contacts, setContacts] = useState<Partial<ObraContact>[]>([{ name: '', type: undefined, phone: '' }]);
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [unidade, setUnidade] = useState('');
  const [etapa, setEtapa] = useState('');
  const [lojas, setLojas] = useState<Loja[]>([]);
  
  // State for photo preview and data
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoDataUrls, setPhotoDataUrls] = useState<string[]>([]);


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
    setDetails('');
    setContacts([{ name: '', type: undefined, phone: '' }]);
    setRua('');
    setNumero('');
    setBairro('');
    setUnidade('');
    setEtapa('');
    setPhotoPreviews([]);
    setPhotoDataUrls([]);
  };

  const handleLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using a free, no-key-required service for reverse geocoding
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
  
  const handleContactChange = (index: number, field: keyof ObraContact, value: string) => {
    const newContacts = [...contacts];
    let processedValue = value;
    if (field === 'phone') {
        processedValue = value.replace(/\D/g, ''); // Remove non-numeric characters
    }
    newContacts[index] = { ...newContacts[index], [field]: processedValue };
    setContacts(newContacts);
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', type: undefined, phone: '' }]);
  };

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: string[] = [];
      const newDataUrls: string[] = [];
      const fileList = Array.from(files);

      let hasError = false;
      fileList.forEach(file => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({
            variant: 'destructive',
            title: 'Arquivo muito grande',
            description: `O arquivo ${file.name} excede o tamanho máximo de ${MAX_FILE_SIZE_MB}MB.`,
          });
          hasError = true;
        }
      });
      if(hasError) return;


      fileList.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(URL.createObjectURL(file));
            newDataUrls.push(reader.result as string);
            if(newPreviews.length === fileList.length) {
              setPhotoPreviews(prev => [...prev, ...newPreviews]);
              setPhotoDataUrls(prev => [...prev, ...newDataUrls]);
            }
          };
          reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setPhotoPreviews(previews => previews.filter((_, i) => i !== index));
    setPhotoDataUrls(dataUrls => dataUrls.filter((_, i) => i !== index));
  };
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    
    formData.append('street', rua);
    formData.append('number', numero);
    formData.append('neighborhood', bairro);
    formData.append('details', details);
    formData.append('lojaId', unidade);
    formData.append('stage', etapa);

    const validContacts = contacts.filter(c => c.type && c.phone && c.name);
    formData.append('contacts', JSON.stringify(validContacts));
    
    photoDataUrls.forEach((url) => {
        formData.append('photoDataUrls', url);
    });

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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Nova Prospecção de Obra</DialogTitle>
          <DialogDescription>
            Preencha os dados para registrar uma nova obra.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">

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
            
            <Button type="button" variant="outline" className="w-full" onClick={handleLocation} disabled={isLocating}>
              <MapPin className="mr-2 h-4 w-4" />
              {isLocating ? 'Obtendo localização...' : 'Usar Localização Atual'}
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <div className='col-span-2'>
                <Label htmlFor="street">Rua</Label>
                <Input id="street" name="street" placeholder="Ex: Av. Brasil" required value={rua} onChange={e => setRua(e.target.value)} />
              </div>
               <div>
                <Label htmlFor="number">N.º</Label>
                <Input id="number" name="number" placeholder="Ex: 123" required value={numero} onChange={e => setNumero(e.target.value.replace(/\\D/g, ''))} type="text" inputMode="numeric" />
              </div>
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" name="neighborhood" placeholder="Ex: Centro" required value={bairro} onChange={e => setBairro(e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label>Contatos</Label>
              {contacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                   <Input 
                    placeholder="Nome do Contato"
                    className="md:col-span-2" 
                    value={contact.name} 
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  />
                   <Select 
                      value={contact.type} 
                      onValueChange={(value) => handleContactChange(index, 'type', value as ContactType)}
                   >
                    <SelectTrigger>
                        <SelectValue placeholder="Função" />
                    </SelectTrigger>
                    <SelectContent>
                        {contactTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="(XX) XXXXX-XXXX" 
                      value={contact.phone} 
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      type="tel"
                      inputMode='numeric'
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeContact(index)} disabled={contacts.length === 1}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addContact} className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar Contato
              </Button>
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
              <Label htmlFor="details">Detalhes</Label>
              <Textarea id="details" name="details" placeholder="Detalhes sobre a obra, cliente ou prospecção." value={details} onChange={e => setDetails(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="photos">Fotos</Label>
              <Input id="photos" name="photos" type="file" accept="image/*" multiple onChange={handleFileChange} />
            </div>

             {photoPreviews.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative w-fit">
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
