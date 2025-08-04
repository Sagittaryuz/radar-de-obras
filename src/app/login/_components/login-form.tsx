
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { loginAction } from '../actions';
import { Loader2 } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    startTransition(async () => {
      try {
        // 1. Authenticate with Firebase on the client
        const auth = getAuth(app);
        await signInWithEmailAndPassword(auth, data.email, data.password);

        // 2. If Firebase auth is successful, call the server action
        // to set the session cookie.
        const result = await loginAction(data);

        if (result?.error) {
          toast({
            variant: 'destructive',
            title: 'Erro de Login',
            description: result.error,
          });
        } else {
          toast({
            title: 'Login bem-sucedido!',
            description: 'Redirecionando para o dashboard...',
          });
          // Force a full page reload to ensure the new session is picked up by the server layout.
          window.location.href = '/dashboard';
        }
      } catch (error: any) {
        // Handle Firebase authentication errors
        let errorMessage = 'Ocorreu um erro. Verifique suas credenciais.';
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = 'Email ou senha inválidos.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'O formato do email é inválido.';
                break;
        }
        toast({
          variant: 'destructive',
          title: 'Erro de Autenticação',
          description: errorMessage,
        });
      }
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Bem-vindo de volta!</CardTitle>
        <CardDescription>Insira suas credenciais para acessar o sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seuemail@jcruzeiro.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
