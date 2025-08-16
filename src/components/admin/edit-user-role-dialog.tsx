
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Loja, User, UserRole } from '@/lib/firestore-data';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface EditUserRoleDialogProps {
  user: User;
  lojas: Loja[];
  onUserUpdate: () => void;
}

const roles: UserRole[] = ['Admin', 'Gerente', 'Vendedor'];

export function EditUserRoleDialog({ user, lojas, onUserUpdate }: EditUserRoleDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [selectedLoja, setSelectedLoja] = useState<string | undefined>(user.lojaId);

  useEffect(() => {
    if (open) {
      setSelectedRole(user.role);
      setSelectedLoja(user.lojaId);
    }
  }, [open, user]);

  const handleSave = () => {
    if ((selectedRole === 'Gerente' || selectedRole === 'Vendedor') && !selectedLoja) {
        toast({
            variant: 'destructive',
            title: 'Loja necessária',
            description: 'Por favor, selecione uma loja para Gerentes e Vendedores.'
        });
        return;
    }

    startTransition(async () => {
      try {
        const userRef = doc(db, 'users', user.id);
        
        const payload: { role: UserRole; lojaId?: string | ReturnType<typeof deleteField> } = {
            role: selectedRole,
        };

        if (selectedRole === 'Gerente' || selectedRole === 'Vendedor') {
            payload.lojaId = selectedLoja;
        } else {
            // If role is Admin, remove the lojaId field instead of setting it to undefined
            payload.lojaId = deleteField();
        }

        await updateDoc(userRef, payload);
        
        toast({
          title: "Sucesso!",
          description: `A função de ${user.name} foi atualizada.`,
        });
        setOpen(false);
        onUserUpdate(); // Refresh the user list in the parent component
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
         toast({
          variant: 'destructive',
          title: "Erro",
          description: `Falha ao atualizar. Detalhes: ${errorMessage}`,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Função de {user.name}</DialogTitle>
          <DialogDescription>
            Defina a função e, se necessário, a loja do usuário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <Label htmlFor="role">Função</Label>
                <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {(selectedRole === 'Gerente' || selectedRole === 'Vendedor') && (
                <div>
                    <Label htmlFor="loja">Loja</Label>
                    <Select value={selectedLoja} onValueChange={setSelectedLoja}>
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
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
