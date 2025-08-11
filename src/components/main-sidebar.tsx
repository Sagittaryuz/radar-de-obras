
'use client';

import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, ListTodo, Map, User, Settings, DollarSign } from 'lucide-react';
import Link from 'next/link';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/obras', label: 'Obras', icon: ListTodo },
  { href: '/regions', label: 'Regiões', icon: Map },
  { href: '/receitas', label: 'Receitas', icon: DollarSign },
  { href: '/admin', label: 'Admin', icon: Settings },
];


export function MainSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-md">
                <Building2 className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
                <h2 className="font-headline text-xl font-bold" suppressHydrationWarning>Radar de Obras</h2>
                <p className="text-xs text-muted-foreground" suppressHydrationWarning>J. Cruzeiro</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-1">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label, side: 'right' }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span suppressHydrationWarning>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
