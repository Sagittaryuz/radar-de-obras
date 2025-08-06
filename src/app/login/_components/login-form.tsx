'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/app/login/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // Use state to control form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Log the state values directly
    console.log(`[LoginForm] Submitting with - Email: ${email}, Password: ${password ? '******' : '(empty)'}`);

    // Manually create FormData
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    console.log('[LoginForm] FormData created manually. Calling loginAction...');

    startTransition(() => {
      loginAction(undefined, formData).then(result => {
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
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              name="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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