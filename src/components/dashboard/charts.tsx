
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
  'Entrada': '#1f77b4',       // Muted Blue
  'Triagem': '#ff7f0e',      // Safety Orange
  'Atribuída': '#2ca02c',     // Cooked Asparagus Green
  'Em Negociação': '#d62728', // Brick Red
  'Ganha': '#9467bd',         // Muted Purple
  'Perdida': '#8c564b',       // Chestnut Brown
};

const stageColors: Record<string, string> = {
  'Fundação': '#1f77b4',
  'Alvenaria': '#ff7f0e',
  'Acabamento': '#2ca02c',
  'Pintura': '#d62728',
  'Telhado': '#9467bd',
};

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

  // Data for the filtered charts
  const obras = useMemo(() => {
    if (!allObras) return [];
    if (selectedLoja === 'all') {
      return allObras;
    }
    return allObras.filter(obra => obra.lojaId === selectedLoja);
  }, [allObras, selectedLoja]);

  // Data for the summary chart (always shows all lojas)
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
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: statusColors[name] }));
  }, [obras]);

  const obrasByStage = useMemo(() => {
    if (!obras) return [];
    const counts = obras.reduce((acc, obra) => {
      acc[obra.stage] = (acc[obra.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: stageColors[name] }));
  }, [obras]);
  

  if (!allObras || !allLojas) {
    return null; // Or a loading indicator
  }
  
  return (
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

        <div className="flex justify-between items-center">
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

        <div className="grid gap-6 md:grid-cols-2">
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
                  <Bar dataKey="value" radius={4}>
                    {obrasByStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
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
                  <Pie data={obrasByStage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {obrasByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
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
