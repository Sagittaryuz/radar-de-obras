
'use client';

import { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Archive, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

interface ArchiveObraDialogProps {
  obraId: string;
  onSuccess: () => void;
}

export function ArchiveObraDialog({ obraId, onSuccess }: ArchiveObraDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const handleArchive = () => {
    startTransition(async () => {
      try {
        const obraRef = doc(db, 'obras', obraId);
        await updateDoc(obraRef, { status: 'Arquivada' });
        
        toast({
          title: "Obra Encerrada",
          description: "A obra foi movida para o status 'Arquivada'.",
        });
        setOpen(false);
        onSuccess();

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        toast({
          variant: 'destructive',
          title: "Erro ao Encerrar",
          description: `Não foi possível encerrar a obra. Detalhes: ${errorMessage}`,
        });
      }
    });
  };

  // Only Admins and Gerentes can see this button
  if (user?.role !== 'Admin' && user?.role !== 'Gerente') {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" size="sm">
            <Archive className="mr-2 h-4 w-4" />
            Encerrar Obra
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Encerrar esta Obra?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação moverá a obra para o status "Arquivada". Ela não aparecerá mais
            nos quadros principais, mas continuará nos relatórios. Esta ação pode ser revertida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Encerrando...</span>
              </>
            ) : (
              'Sim, encerrar obra'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
