
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do aplicativo.</p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Sistema de Login</CardTitle>
                <CardDescription>O sistema de login está temporariamente desativado.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    O acesso ao aplicativo está atualmente aberto sem a necessidade de autenticação.
                    A funcionalidade de login e perfis de usuário pode ser reativada no futuro.
                </p>
            </CardContent>
       </Card>
    </div>
  );
}
