
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Login Desativado</CardTitle>
        <CardDescription>O acesso ao sistema agora é direto. Você será redirecionado.</CardDescription>
      </CardHeader>
      <CardContent>
          <p className="text-sm text-muted-foreground text-center">
              Redirecionando para o dashboard...
          </p>
      </CardContent>
    </Card>
  );
}
