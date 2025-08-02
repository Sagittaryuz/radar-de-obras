'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Obra, Loja } from '@/lib/mock-data';
import { useMemo } from 'react';

interface DashboardChartsProps {
  obras: Obra[];
  lojas: Loja[];
}

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function DashboardCharts({ obras, lojas }: DashboardChartsProps) {
  const lojaMap = useMemo(() => {
    return lojas.reduce((acc, loja) => {
      acc[loja.id] = loja.name;
      return acc;
    }, {} as Record<string, string>);
  }, [lojas]);

  const obrasByStatus = useMemo(() => {
    const counts = obras.reduce((acc, obra) => {
      acc[obra.status] = (acc[obra.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [obras]);

  const obrasByStage = useMemo(() => {
    const counts = obras.reduce((acc, obra) => {
      acc[obra.stage] = (acc[obra.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [obras]);

  const obrasByLoja = useMemo(() => {
    const counts = obras.reduce((acc, obra) => {
      const lojaName = lojaMap[obra.lojaId] || 'Desconhecida';
      acc[lojaName] = (acc[lojaName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [obras, lojaMap]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Obras por Status</CardTitle>
          <CardDescription>Contagem de obras em cada status do funil de vendas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={obrasByStatus} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Obras por Etapa</CardTitle>
          <CardDescription>Distribuição de obras por etapa de construção.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={obrasByStage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {obrasByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer>
              <BarChart data={obrasByLoja} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={80} />
                <XAxis type="number" />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
