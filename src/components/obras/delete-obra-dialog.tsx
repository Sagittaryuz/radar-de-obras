
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, deleteObject } from 'firebase/storage';
import { getObraById } from '@/lib/firestore-data';
import type { Obra } from '@/lib/firestore-data';

interface DeleteObraDialogProps {
  obraId: string;
}

export function DeleteObraDialog({ obraId }: DeleteObraDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const obraToDelete = await getObraById(obraId);

        // Delete photos from storage first
        if (obraToDelete && obraToDelete.photoUrls && obraToDelete.photoUrls.length > 0) {
            for (const url of obraToDelete.photoUrls) {
                try {
                    const photoRef = ref(storage, url);
                    await deleteObject(photoRef);
                } catch (storageError) {
                    // Log the error but continue, so that DB deletion can proceed even if one photo fails.
                    console.error(`Failed to delete photo from storage: ${url}`, storageError);
                }
            }
        }

        // Delete the document from Firestore
        await deleteDoc(doc(db, 'obras', obraId));
        
        toast({
          title: "Obra Excluída",
          description: "A obra foi removida permanentemente.",
        });
        setOpen(false);
        router.push('/obras');
        router.refresh();

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        toast({
          variant: 'destructive',
          title: "Erro ao Excluir",
          description: `Não foi possível excluir a obra. Detalhes: ${errorMessage}`,
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá excluir permanentemente a
            obra do banco de dados e suas fotos associadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              'Sim, excluir obra'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
