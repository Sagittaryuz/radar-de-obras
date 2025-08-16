
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';


function getInitials(name: string) {
    if (!name) return '...';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
             <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as configurações do seu perfil.</p>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                     <Skeleton className="h-16 w-16 rounded-full" />
                     <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-52" />
                     </div>
                </CardContent>
            </Card>
        </div>
    )
  }
  
  if (!user) {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
             <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Nenhum usuário logado.</p>
            </div>
        </div>
    );
  }


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu perfil.</p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Seu Perfil</CardTitle>
                <CardDescription>Estas são as suas informações de usuário.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-lg font-semibold">{user.name}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </CardContent>
       </Card>
        <Button variant="outline" onClick={logout}>Sair da sua conta</Button>
    </div>
  );
}
