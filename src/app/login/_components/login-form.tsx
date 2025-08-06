
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/app/login/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';


export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    // Log to check FormData content on the client
    console.log('[LoginForm] FormData created. Email:', formData.get('email'), 'Password:', formData.get('password'));
    console.log('[LoginForm] Form submitted. Calling loginAction...');

    startTransition(async () => {
      console.log('[LoginForm] Calling loginAction...');
      const result = await loginAction(undefined, formData);
      console.log('[LoginForm] loginAction returned:', result);

      if (result?.error) {
        console.error('[LoginForm] Login failed with error from state:', result.error);
        setError(result.error);
        toast({
          variant: 'destructive',
          title: 'Erro de Login',
          description: result.error,
        });
      } else {
        console.log('[LoginForm] Login successful, redirect should have occurred.');
      }
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Login</CardTitle>
        <CardDescription>Entre com seu e-mail e senha para acessar o sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Entrando...</span>
                </>
            ) : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
