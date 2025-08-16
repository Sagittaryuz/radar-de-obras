
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard.
    // This can happen if they navigate to /login directly while already authenticated.
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      // On successful login, the AuthProvider state will change,
      // and the main layout will automatically handle the redirect to the dashboard.
    } catch (error: any) {
      toast({
        title: 'Erro de Autenticação',
        description: error.message || 'E-mail ou senha inválidos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline text-primary">Radar de Obras</h1>
            <p className="text-balance text-muted-foreground">
              Entre com seu e-mail para acessar o painel
            </p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@jcruzeiro.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                {/* 
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Esqueceu sua senha?
                </Link>
                */}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080.png"
          data-ai-hint="construction site"
          alt="Image of a construction site"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
