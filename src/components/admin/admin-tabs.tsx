'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EditNeighborhoodsDialog } from "./edit-neighborhoods-dialog";
import type { User, Loja } from "@/lib/mock-data";

interface AdminTabsProps {
  users: User[];
  lojas: Loja[];
}

function getInitials(name: string) {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}

export function AdminTabs({ users, lojas }: AdminTabsProps) {
  return (
    <Tabs defaultValue="users">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="users">Usuários</TabsTrigger>
        <TabsTrigger value="lojas">Lojas</TabsTrigger>
        <TabsTrigger value="regions">Regiões</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Usuários</CardTitle>
            <CardDescription>Gerencie os usuários do sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                           <AvatarImage src={user.avatar} alt={user.name} />
                           <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="lojas">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Lojas</CardTitle>
            <CardDescription>Gerencie as lojas e pontos de venda.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome da Loja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lojas.map(loja => (
                  <TableRow key={loja.id}>
                    <TableCell className="font-mono text-sm">{loja.id}</TableCell>
                    <TableCell className="font-medium">{loja.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="regions">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Regiões</CardTitle>
            <CardDescription>Gerencie os bairros de atendimento de cada loja.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lojas.map(loja => (
                <Card key={loja.id} className="bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">{loja.name}</CardTitle>
                        <EditNeighborhoodsDialog loja={loja} />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {loja.neighborhoods.length > 0 ? (
                              loja.neighborhoods.map(bairro => (
                                <Badge key={bairro} variant="secondary">{bairro}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">Nenhum bairro cadastrado.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
