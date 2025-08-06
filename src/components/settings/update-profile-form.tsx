
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { User } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/actions';
import { useTransition, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const profileSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getInitials(name: string) {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}


export default function UpdateProfileForm({ user }: { user: User }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    startTransition(async () => {
        try {
            // Start with the existing user data to ensure all fields are present
            const updatePayload: User = {
                ...user, // Use the spread operator to get all fields from the current user
                name: data.name,
                email: data.email, // email is disabled, but good practice to include it
            };

            if (avatarFile) {
                const avatarReader = new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(avatarFile);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                });
                const avatarDataUrl = await avatarReader;
                
                const fileName = `avatars/${user.id}-${Date.now()}.jpg`;
                const storageRef = ref(storage, fileName);
                const uploadResult = await uploadString(storageRef, avatarDataUrl, 'data_url');
                updatePayload.avatar = await getDownloadURL(uploadResult.ref);
            }

            // Use setDoc with merge: true instead of updateDoc.
            // This will create the document if it doesn't exist, or update it if it does.
            const userRef = doc(db, 'users', user.id);
            await setDoc(userRef, updatePayload, { merge: true });

            toast({
                title: 'Sucesso!',
                description: 'Seu perfil foi atualizado. A alteração pode levar alguns instantes para ser refletida em toda a aplicação.',
            });
            
            // Wait a bit before refreshing to allow data propagation
            setTimeout(() => router.refresh(), 1000);


        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: `Não foi possível atualizar seu perfil: ${errorMessage}`,
            });
        }
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">Perfil</CardTitle>
            <CardDescription>Atualize seu nome e foto de perfil. O email não pode ser alterado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormItem>
                <FormLabel>Foto de Perfil</FormLabel>
                <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarPreview || undefined} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <FormControl>
                    <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </FormControl>
                </div>
                <FormMessage />
            </FormItem>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu email" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
