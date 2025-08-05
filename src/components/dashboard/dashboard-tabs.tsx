
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardCharts } from "./charts";
import type { Obra, Loja } from "@/lib/mock-data";

interface DashboardTabsProps {
  allObras: Obra[];
  allLojas: Loja[];
}

export function DashboardTabs({ allObras, allLojas }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="charts">
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="charts">Gráficos</TabsTrigger>
      </TabsList>
      <TabsContent value="charts">
        <DashboardCharts allObras={allObras} allLojas={allLojas} />
      </TabsContent>
    </Tabs>
  );
}
