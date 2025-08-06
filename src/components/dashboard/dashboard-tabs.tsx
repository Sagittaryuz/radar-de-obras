
'use client';

import { DashboardCharts } from "./charts";
import type { Obra, Loja } from "@/lib/mock-data";

interface DashboardTabsProps {
  allObras: Obra[];
  allLojas: Loja[];
}

export function DashboardTabs({ allObras, allLojas }: DashboardTabsProps) {
  return (
      <DashboardCharts allObras={allObras} allLojas={allLojas} />
  );
}
