
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/app/login/actions';
import { useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[LoginForm] State updated:', state);
    if (state?.error) {
      console.error('[LoginForm] Login failed with error from state:', state.error);
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: state.error,
      });
    }
    if (state?.success) {
      console.log('[LoginForm] Login successful, redirect should have happened on the server.');
    }
  }, [state, toast]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Login</CardTitle>
        <CardDescription>Entre com seu e-mail e senha para acessar o sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
