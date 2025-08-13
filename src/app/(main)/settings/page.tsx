
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

function getInitials(name: string) {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}


export default function SettingsPage() {
    const { user, logout } = useAuth();

    if (!user) {
        return null; // Or a loading indicator
    }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as informações do seu perfil.</p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Estas são as suas informações de usuário.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{getInitials(user.displayName || user.email || '')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">{user.displayName || 'Usuário'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                 <Button variant="destructive" onClick={logout}>
                    Sair da Conta
                </Button>
            </CardContent>
       </Card>
    </div>
  );
}
