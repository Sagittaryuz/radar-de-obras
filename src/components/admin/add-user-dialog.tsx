
'use client';

import { useState, useTransition, useEffect } from 'react';
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
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja, User, UserRole } from '@/lib/firestore-data';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth as clientAuth } from '@/lib/firebase';

interface AddUserDialogProps {
  lojas: Loja[];
  onUserAdded: () => void;
}

const roles: UserRole[] = ['Admin', 'Gerente', 'Vendedor'];

export function AddUserDialog({ lojas, onUserAdded }: AddUserDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Vendedor');
  const [lojaId, setLojaId] = useState<string | undefined>(undefined);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('Vendedor');
    setLojaId(undefined);
  };

  const handleSave = () => {
    if (!name || !email || !password || !role) {
        toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Por favor, preencha todos os campos.' });
        return;
    }
    if ((role === 'Gerente' || role === 'Vendedor') && !lojaId) {
        toast({ variant: 'destructive', title: 'Loja necessária', description: 'Selecione uma loja para Gerentes e Vendedores.'});
        return;
    }

    startTransition(async () => {
      try {
        // Step 1: Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
        const user = userCredential.user;

        // Step 2: Create user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        
        const newUserPayload: User = {
            id: user.uid,
            name: name,
            email: email,
            role: role,
            avatar: `https://i.imgur.com/RI2eag9.png`, // Default avatar
            ...( (role === 'Gerente' || role === 'Vendedor') && { lojaId: lojaId })
        };

        await setDoc(userDocRef, newUserPayload);
        
        toast({
          title: "Usuário Criado!",
          description: `${name} foi adicionado ao sistema.`,
        });
        setOpen(false);
        resetForm();
        onUserAdded();
      } catch (error: any) {
         let errorMessage = "Ocorreu um erro desconhecido.";
         if (error.code) {
             switch (error.code) {
                 case 'auth/email-already-in-use':
                     errorMessage = 'Este e-mail já está em uso por outra conta.';
                     break;
                 case 'auth/invalid-email':
                     errorMessage = 'O formato do e-mail é inválido.';
                     break;
                 case 'auth/weak-password':
                     errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
                     break;
                 default:
                     errorMessage = error.message;
             }
         }
         toast({
          variant: 'destructive',
          title: "Erro ao criar usuário",
          description: errorMessage,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo usuário ao sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
             <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">A senha deve ter no mínimo 6 caracteres.</p>
            </div>
            <div>
                <Label htmlFor="role">Função</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {(role === 'Gerente' || role === 'Vendedor') && (
                <div>
                    <Label htmlFor="loja">Loja</Label>
                    <Select value={lojaId} onValueChange={setLojaId}>
                        <SelectTrigger id="loja">
                            <SelectValue placeholder="Selecione uma loja" />
                        </SelectTrigger>
                        <SelectContent>
                             {lojas.map(loja => (
                                <SelectItem key={loja.id} value={loja.id}>{loja.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isPending}>
                  Cancelar
              </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
