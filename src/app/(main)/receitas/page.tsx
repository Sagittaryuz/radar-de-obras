
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Package, TrendingUp, User as UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from 'react';
import { getObras, getLojas, getUsers } from '@/lib/firestore-data';
import type { Obra, Loja, User } from '@/lib/firestore-data';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

const lojaColors: Record<string, string> = {
    matriz: '#3b82f6', // blue-500
    catedral: '#ef4444', // red-500
    'said-abdala': '#22c55e', // green-500
};


export default function ReceitasPage() {
    const [obras, setObras] = useState<Obra[]>([]);
    const [lojas, setLojas] = useState<Loja[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeller, setSelectedSeller] = useState('all');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [obrasData, lojasData, usersData] = await Promise.all([getObras(), getLojas(), getUsers()]);
                setObras(obrasData);
                setLojas(lojasData);
                setUsers(usersData.filter(u => u.role === 'Vendedor')); // Only need sellers
            } catch (error) {
                console.error("Failed to fetch sales data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredObras = useMemo(() => {
        if (selectedSeller === 'all') {
            return obras;
        }
        return obras.filter(obra => obra.sellerId === selectedSeller);
    }, [obras, selectedSeller]);

    const salesData = useMemo(() => {
        const soldObras = filteredObras.filter(obra => obra.status === 'Ganha' && obra.sales && obra.sales.length > 0);
        
        const totalRevenue = soldObras.reduce((sum, obra) => {
            const obraTotal = obra.sales?.reduce((saleSum, sale) => saleSum + sale.value, 0) || 0;
            return sum + obraTotal;
        }, 0);

        const totalSales = soldObras.length;
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        return {
            soldObras,
            totalRevenue,
            totalSales,
            averageTicket
        };
    }, [filteredObras]);
    
    const revenueByLoja = useMemo(() => {
        const lojaMap = lojas.reduce((acc, loja) => {
          acc[loja.id] = { id: loja.id, name: loja.name, total: 0 };
          return acc;
        }, {} as Record<string, {id: string, name: string, total: number}>);

        salesData.soldObras.forEach(obra => {
            if (obra.lojaId && lojaMap[obra.lojaId]) {
                 const obraTotal = obra.sales?.reduce((saleSum, sale) => saleSum + sale.value, 0) || 0;
                 lojaMap[obra.lojaId].total += obraTotal;
            }
        });
        
        return Object.values(lojaMap).map(loja => ({
            id: loja.id,
            name: loja.name,
            value: loja.total,
        })).filter(loja => loja.value > 0);

    }, [salesData.soldObras, lojas]);

    const handleBarClick = (data: any) => {
      if (!data || !data.activePayload || data.activePayload.length === 0) return;
      
      const payload = data.activePayload[0].payload;
      const lojaId = payload.id;
      
      if (!lojaId) return;

      const query = new URLSearchParams();
      query.append('lojaId', lojaId);
      query.append('status', 'Ganha');

      router.push(`/obras?${query.toString()}`);
    };


    if (loading) {
        return (
             <div className="space-y-6">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Receitas e Vendas</h1>
                <p className="text-muted-foreground">
                    Analise o desempenho das vendas por período, vendedor e unidade.
                </p>
                <Skeleton className="h-10 w-full max-w-sm" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-1" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Obras Concluídas</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-1" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ticket Médio por Obra</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-1" />
                        </CardContent>
                    </Card>
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Receitas e Vendas</h1>
                    <p className="text-muted-foreground">
                        Analise o desempenho das vendas por período, vendedor e unidade.
                    </p>
                </div>
                <div className="w-full sm:w-52">
                    <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por vendedor..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Vendedores</SelectItem>
                            {users.map(seller => (
                                <SelectItem key={seller.id} value={seller.id}>{seller.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Soma de todas as vendas concluídas.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Obras Ganhas</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesData.totalSales}</div>
                        <p className="text-xs text-muted-foreground">Número de obras com status "Ganha".</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio por Obra</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(salesData.averageTicket)}</div>
                        <p className="text-xs text-muted-foreground">Valor médio por obra ganha.</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Receita por Unidade</CardTitle>
                    <CardDescription>Soma dos valores de vendas para cada loja. Clique para ver as obras.</CardDescription>
                </CardHeader>
                <CardContent>
                    {revenueByLoja.length > 0 ? (
                        <ChartContainer config={{}} className="h-96 w-full">
                            <BarChart 
                                data={revenueByLoja} 
                                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                onClick={handleBarClick}
                                className="cursor-pointer"
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                <YAxis 
                                    tickFormatter={(value) => formatCurrency(value as number)} 
                                    allowDecimals={false} 
                                    width={100} 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }} 
                                    content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)}/>} 
                                />
                                <Bar dataKey="value" name="Receita" radius={[4, 4, 0, 0]}>
                                    {revenueByLoja.map((entry) => (
                                        <Cell key={entry.id} fill={lojaColors[entry.id] || 'var(--color-chart-1)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex items-center justify-center h-96">
                            <p className="text-muted-foreground">Nenhuma venda registrada para exibir no gráfico.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

}
