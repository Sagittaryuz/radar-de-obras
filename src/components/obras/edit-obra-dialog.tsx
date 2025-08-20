
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
import { Edit, Loader2, Plus, Trash2, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja, Obra, ObraContact, ContactType } from '@/lib/firestore-data';
import { getLojas } from '@/lib/firestore-data';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';

interface EditObraDialogProps {
  obra: Obra;
  onSuccess: () => void;
}

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


export function EditObraDialog({ obra, onSuccess }: EditObraDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lojas, setLojas] = useState<Loja[]>([]);
  
  // States for form fields
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [details, setDetails] = useState('');
  const [lojaId, setLojaId] = useState('');
  const [stage, setStage] = useState<Obra['stage'] | ''>('');
  const [contacts, setContacts] = useState<Partial<ObraContact>[]>([]);

  // States for photo management
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);


  useEffect(() => {
    // When the dialog opens, initialize form data with the current obra data.
    if (open) {
        setStreet(obra.street || '');
        setNumber(obra.number || '');
        setNeighborhood(obra.neighborhood || '');
        setDetails(obra.details || '');
        setLojaId(obra.lojaId || '');
        setStage(obra.stage || '');
        setContacts(obra.contacts && obra.contacts.length > 0 ? obra.contacts : [{ name: '', type: undefined, phone: '' }]);
        setExistingPhotoUrls(obra.photoUrls || []);
        
        // Reset photo states
        setNewPhotoFiles([]);
        setNewPhotoPreviews([]);
        setPhotosToDelete([]);

        const fetchLojas = async () => {
            const lojasData = await getLojas();
            setLojas(lojasData);
        };
        fetchLojas();
    } else {
        // Clean up previews when dialog is closed
        newPhotoPreviews.forEach(URL.revokeObjectURL);
    }
  }, [open, obra]);
  
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
    if (!files) return;

    const validFiles = Array.from(files);
    setNewPhotoFiles(prev => [...prev, ...validFiles]);

    const previews = validFiles.map(file => URL.createObjectURL(file));
    setNewPhotoPreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNewPhoto = (indexToRemove: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newPhotoPreviews[indexToRemove]);

    setNewPhotoFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };
  
  const handleRemoveExistingPhoto = (url: string) => {
    setExistingPhotoUrls(prev => prev.filter(u => u !== url));
    setPhotosToDelete(prev => [...prev, url]);
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const address = `${street}, ${number}, ${neighborhood}`;
    const validContacts = contacts
      .filter(c => c.name && c.type && c.phone)
      .map(c => c as ObraContact);

    if (validContacts.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Contato Obrigatório',
            description: 'É necessário ter pelo menos um contato válido (com nome, função e telefone).',
        });
        return;
    }


    startTransition(async () => {
      try {
        toast({ title: 'Atualizando obra...', description: 'Aguarde um momento.' });

        // 1. Delete photos marked for deletion
        for (const urlToDelete of photosToDelete) {
          try {
            const photoRef = ref(storage, urlToDelete);
            await deleteObject(photoRef);
          } catch (error: any) {
             // Ignore "object not found" errors, as it might have been already deleted
            if (error.code !== 'storage/object-not-found') {
              console.warn(`Failed to delete photo: ${urlToDelete}`, error);
            }
          }
        }

        // 2. Upload new photos
        const newUploadedUrls: string[] = [];
        if (newPhotoFiles.length > 0) {
            toast({ title: 'Enviando fotos...', description: `Preparando ${newPhotoFiles.length} nova(s) foto(s).`});
            const uploadPromises = newPhotoFiles.map(async (file, index) => {
                const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
                const fileName = `obras/${Date.now()}-${sanitizedFileName}`;
                const storageRef = ref(storage, fileName);
                const uploadResult = await uploadBytes(storageRef, file);
                toast({ title: 'Enviando fotos...', description: `${index + 1} de ${newPhotoFiles.length} fotos enviadas.`});
                return getDownloadURL(uploadResult.ref);
            });
            const urls = await Promise.all(uploadPromises);
            newUploadedUrls.push(...urls);
        }

        // 3. Construct final payload
        const finalPhotoUrls = [...existingPhotoUrls, ...newUploadedUrls];
        const payload: Partial<Obra> = {
            street,
            number,
            neighborhood,
            address,
            clientName: validContacts[0].name || address,
            details,
            lojaId,
            stage: stage as Obra['stage'],
            contacts: validContacts,
            photoUrls: finalPhotoUrls,
        };

        // 4. Update Firestore document
        const obraRef = doc(db, 'obras', obra.id);
        await updateDoc(obraRef, payload);
        
        toast({
            title: "Obra Atualizada",
            description: "Os dados e fotos da obra foram atualizados.",
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Obra</DialogTitle>
          <DialogDescription>
            Modifique os dados da obra abaixo, adicione ou remova fotos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            
            <div className="grid grid-cols-3 gap-2">
              <div className='col-span-2'>
                <Label htmlFor="street">Rua</Label>
                <Input id="street" placeholder="Ex: Av. Brasil" value={street} onChange={(e) => setStreet(e.target.value)} />
              </div>
               <div>
                <Label htmlFor="number">N.º</Label>
                <Input id="number" placeholder="Ex: 123" value={number} onChange={(e) => setNumber(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" placeholder="Ex: Centro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
            </div>
            
            <div className="space-y-3">
              <Label>Contatos</Label>
              {contacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 p-2 border rounded-md">
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
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addContact} className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar Contato
              </Button>
            </div>

             <div>
              <Label htmlFor="details">Detalhes</Label>
              <Textarea id="details" placeholder="Detalhes da obra" value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="lojaId">Unidade J. Cruzeiro</Label>
              <Select onValueChange={(value) => setLojaId(value)} value={lojaId}>
                  <SelectTrigger id="lojaId">
                      <SelectValue placeholder="Selecione a unidade responsável" />
                  </SelectTrigger>
                  <SelectContent>
                      {lojas.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stage">Etapa da Obra</Label>
              <Select onValueChange={(value) => setStage(value as Obra['stage'])} value={stage}>
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

            <div className="space-y-3">
                <Label htmlFor="photos">Fotos</Label>
                <div className="p-4 border-dashed border-2 rounded-md space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {/* Existing Photos */}
                        {existingPhotoUrls.map((url) => (
                            <div key={url} className="relative group">
                                <Image src={url} alt="Foto existente" width={100} height={100} className="rounded-md object-cover aspect-square" />
                                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveExistingPhoto(url)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {/* New Photo Previews */}
                         {newPhotoPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <Image src={preview} alt={`Nova foto ${index+1}`} width={100} height={100} className="rounded-md object-cover aspect-square" />
                                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveNewPhoto(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                     <Input id="photos" type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full" />
                </div>
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

    