
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Obra, Loja } from '@/lib/mock-data';
import { useMemo, useState } from 'react';

interface DashboardChartsProps {
  allObras: Obra[];
  allLojas: Loja[];
}

const statusColors: Record<string, string> = {
  'Entrada': 'hsl(var(--chart-1))',
  'Triagem': 'hsl(var(--chart-2))',
  'Atribuída': 'hsl(var(--chart-3))',
  'Em Negociação': 'hsl(var(--chart-4))',
  'Ganha': 'hsl(var(--chart-5))',
  'Perdida': 'hsl(var(--destructive))',
};

const stageColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const obraStatuses: Obra['status'][] = ['Entrada', 'Triagem', 'Atribuída', 'Em Negociação', 'Ganha', 'Perdida'];

export function DashboardCharts({ allObras, allLojas }: DashboardChartsProps) {
  const [selectedLoja, setSelectedLoja] = useState('all');

  const lojaMap = useMemo(() => {
    if (!allLojas) return {};
    return allLojas.reduce((acc, loja) => {
      acc[loja.id] = loja.name;
      return acc;
    }, {} as Record<string, string>);
  }, [allLojas]);

  const obras = useMemo(() => {
    if (!allObras) return [];
    if (selectedLoja === 'all') {
      return allObras;
    }
    return allObras.filter(obra => obra.lojaId === selectedLoja);
  }, [allObras, selectedLoja]);

  // Data for the new summary chart (always shows all lojas)
  const summaryData = useMemo(() => {
    if (!allLojas || !allObras) return [];
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
    if (!obras) return [];
    const counts = obras.reduce((acc, obra) => {
      acc[obra.status] = (acc[obra.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [obras]);

  const obrasByStage = useMemo(() => {
    if (!obras) return [];
    const counts = obras.reduce((acc, obra) => {
      acc[obra.stage] = (acc[obra.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [obras]);

  const obrasByLoja = useMemo(() => {
    if (!allObras || !lojaMap) return []; // Always use allObras for this chart
    const counts = allObras.reduce((acc, obra) => {
      const lojaName = lojaMap[obra.lojaId] || 'Desconhecida';
      acc[lojaName] = (acc[lojaName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allObras, lojaMap]);

  if (!allObras || !allLojas) {
    return null; // Or a loading indicator
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            {selectedLoja === 'all' ? 'Dashboard Geral' : `Dashboard ${lojaMap[selectedLoja]}`}
          </h1>
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
      </div>
      <div className="space-y-6">
        <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="font-headline">Resumo de Obras por Loja</CardTitle>
              <CardDescription>Distribuição de obras por status em cada loja.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80 w-full">
                <BarChart data={summaryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                  <Legend />
                  {obraStatuses.map(status => (
                    <Bar key={`summary-${status}`} dataKey={status} stackId="a" fill={statusColors[status]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ChartContainer>
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Obras por Status</CardTitle>
              <CardDescription>Contagem de obras em cada status do funil.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64 w-full">
                <BarChart data={obrasByStatus} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
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
                  <Pie data={obrasByStage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {obrasByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={stageColors[index % stageColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Obras por Loja</CardTitle>
              <CardDescription>Contagem de obras por unidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64 w-full">
                <BarChart data={obrasByLoja} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={80} />
                  <XAxis type="number" allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
