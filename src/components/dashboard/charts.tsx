
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Obra, Loja, User } from '@/lib/firestore-data';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth-context';

interface DashboardChartsProps {
  allObras: Obra[];
  allLojas: Loja[];
  allUsers: User[];
}

const statusColors: Record<string, string> = {
  'Entrada': '#1f77b4',
  'Triagem': '#ff7f0e',
  'Atribuída': '#2ca02c',
  'Em Negociação': '#d62728',
  'Ganha': '#9467bd',
  'Perdida': '#8c564b',
  'Arquivada': '#7f7f7f',
};

const stageColors: Record<string, string> = {
  'Fundação': '#1f77b4',
  'Alvenaria': '#ff7f0e',
  'Acabamento': '#2ca02c',
  'Pintura': '#d62728',
  'Telhado': '#9467bd',
};

const obraStatuses: Obra['status'][] = ['Entrada', 'Triagem', 'Atribuída', 'Em Negociação', 'Ganha', 'Perdida', 'Arquivada'];

export function DashboardCharts({ allObras, allLojas, allUsers }: DashboardChartsProps) {
  const [selectedLoja, setSelectedLoja] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState('all');
  const router = useRouter();
  const { user } = useAuth();

  const vendedores = useMemo(() => allUsers.filter(u => u.role === 'Vendedor'), [allUsers]);

  // Set the loja filter based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'Gerente' && user.lojaId) {
        setSelectedLoja(user.lojaId);
      } else if (user.role === 'Vendedor') {
        setSelectedLoja('all');
        setSelectedSeller(user.id);
      }
    }
  }, [user]);

  const lojaMap = useMemo(() => {
    return allLojas.reduce((acc, loja) => {
      acc[loja.id] = loja.name;
      return acc;
    }, {} as Record<string, string>);
  }, [allLojas]);
  
  const lojaIdMap = useMemo(() => {
    return allLojas.reduce((acc, loja) => {
      acc[loja.name] = loja.id;
      return acc;
    }, {} as Record<string, string>);
  }, [allLojas]);

  // Data for the filtered charts
  const obras = useMemo(() => {
    let filtered = allObras;
    if (selectedLoja !== 'all') {
      filtered = filtered.filter(obra => obra.lojaId === selectedLoja);
    }
    if (selectedSeller !== 'all') {
      filtered = filtered.filter(obra => obra.sellerId === selectedSeller);
    }
    return filtered;
  }, [allObras, selectedLoja, selectedSeller]);

  // Data for the summary chart (always shows all lojas)
  const summaryData = useMemo(() => {
    const dataByLoja = allLojas.map(loja => {
      const lojaObras = allObras.filter(o => o.lojaId === loja.id);
      const statusCounts = obraStatuses.reduce((acc, status) => {
        acc[status] = lojaObras.filter(o => o.status === status).length;
        return acc;
      }, {} as Record<Obra['status'], number>);
      
      return {
        name: loja.name,
        ...statusCounts,
      };
    });
    return dataByLoja;
  }, [allObras, allLojas]);


  const obrasByStatus = useMemo(() => {
    const counts = obras.reduce((acc, obra) => {
      acc[obra.status] = (acc[obra.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: statusColors[name] }));
  }, [obras]);

  const obrasByStage = useMemo(() => {
    const counts = obras.reduce((acc, obra) => {
      acc[obra.stage] = (acc[obra.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: stageColors[name] }));
  }, [obras]);
  

  const handleBarClick = (data: any, filterKey: 'status' | 'stage') => {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    const payload = data.activePayload[0].payload;
    const filterValue = payload.name;
    const query = new URLSearchParams();
    query.append(filterKey, filterValue);
    if(selectedLoja !== 'all') {
        query.append('lojaId', selectedLoja)
    }
    router.push(`/obras?${query.toString()}`);
  }

  const handleSummaryBarClick = (data: any) => {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    
    const status = data.activePayload[0].dataKey;
    const lojaName = data.activeLabel;
    const lojaId = lojaIdMap[lojaName];

    if (!lojaId || !status) return;

    const query = new URLSearchParams();
    query.append('lojaId', lojaId);
    query.append('status', status as string);

    router.push(`/obras?${query.toString()}`);
  };


  if (!allObras || !allLojas) {
    return null;
  }
  
  return (
    <div className="space-y-6">
        <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="font-headline">Resumo de Obras por Loja</CardTitle>
              <CardDescription>Distribuição de obras por status em cada loja. Clique para filtrar.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full whitespace-nowrap">
                <ChartContainer config={{}} className="h-80 w-full min-w-[600px]">
                  <BarChart data={summaryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleSummaryBarClick}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                    <Legend />
                    {obraStatuses.map(status => (
                      <Bar key={`summary-${status}`} dataKey={status} stackId="a" fill={statusColors[status]} radius={[4, 4, 0, 0]} className='cursor-pointer' />
                    ))}
                  </BarChart>
                </ChartContainer>
              </ScrollArea>
            </CardContent>
        </Card>

        <div className="flex justify-between items-center">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Dashboard
            </h1>
            <div className="flex items-center gap-2">
                {/* Vendedor Filter */}
                {user?.role !== 'Vendedor' && (
                  <div className="w-full max-w-xs">
                    <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por vendedor..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Vendedores</SelectItem>
                            {vendedores.map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Loja Filter */}
                {user?.role === 'Admin' && (
                  <div className="w-full max-w-xs">
                    <Select value={selectedLoja} onValueChange={setSelectedLoja}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por loja..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Lojas</SelectItem>
                            {allLojas.map(loja => (
                                <SelectItem key={loja.id} value={loja.id}>{loja.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                )}
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Obras por Status</CardTitle>
              <CardDescription>Contagem de obras em cada status do funil.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64 w-full">
                <BarChart data={obrasByStatus} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={(data) => handleBarClick(data, 'status')}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={4}>
                    {obrasByStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} className='cursor-pointer'/>
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Obras por Etapa</CardTitle>
              <CardDescription>Distribuição por etapa de construção.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64 w-full">
                <PieChart>
                  <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie 
                    data={obrasByStage} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label
                    onClick={(data) => handleBarClick({ activePayload: [{ payload: data }] } as any, 'stage')}
                    >
                    {obrasByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className='cursor-pointer' />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
