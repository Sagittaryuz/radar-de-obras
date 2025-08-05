
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardCharts } from "./charts";
import { AiAssistant } from "./ai-assistant";
import type { Obra, Loja } from "@/lib/mock-data";

interface DashboardTabsProps {
  allObras: Obra[];
  allLojas: Loja[];
}

export function DashboardTabs({ allObras, allLojas }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="charts">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="charts">Gráficos</TabsTrigger>
        <TabsTrigger value="ai-assistant">Assistente de IA</TabsTrigger>
      </TabsList>
      <TabsContent value="charts">
        <DashboardCharts allObras={allObras} allLojas={allLojas} />
      </TabsContent>
      <TabsContent value="ai-assistant">
        <AiAssistant />
      </TabsContent>
    </Tabs>
  );
}
