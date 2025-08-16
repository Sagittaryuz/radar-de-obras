
'use client';

import { DashboardCharts } from "./charts";
import type { Obra, Loja, User } from "@/lib/firestore-data";

interface DashboardTabsProps {
  allObras: Obra[];
  allLojas: Loja[];
  allUsers: User[];
}

export function DashboardTabs({ allObras, allLojas, allUsers }: DashboardTabsProps) {
  return (
      <DashboardCharts allObras={allObras} allLojas={allLojas} allUsers={allUsers} />
  );
}
