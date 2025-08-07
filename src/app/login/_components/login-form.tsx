
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export function LoginForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            
            const result = await createSession(idToken);

            if (result.success) {
                redirect('/dashboard');
            } else {
                 setError(result.error || 'Falha ao criar sessão.');
                 toast({
                    variant: 'destructive',
                    title: 'Erro de Login',
                    description: result.error || 'Não foi possível iniciar a sessão no servidor.',
                });
            }

        } catch (error: any) {
            let errorMessage = 'Ocorreu um erro desconhecido.';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Email ou senha inválidos.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
                    break;
                 default:
                    console.error('[LoginForm] Firebase Auth Error:', error);
                    break;
            }
            setError(errorMessage);
            toast({
                variant: 'destructive',
                title: 'Erro de Login',
                description: errorMessage,
            });
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
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              required
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
