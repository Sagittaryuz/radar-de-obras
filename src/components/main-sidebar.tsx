
'use client';

import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, ListTodo, Map, Shield, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@/lib/mock-data';
import { logoutAction } from '@/app/login/actions';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/obras', label: 'Obras', icon: ListTodo },
  { href: '/regions', label: 'Regiões', icon: Map },
];

const adminMenuItem = { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true };

export function MainSidebar({ user }: { user: User }) {
  const pathname = usePathname();

  const allMenuItems = user.email === 'marcos.pires@jcruzeiro.com' 
    ? [...menuItems, adminMenuItem] 
    : menuItems;

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
          {allMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
      <SidebarSeparator />
        <SidebarFooter className="p-2">
            <div className="pb-2">
              <UserNav user={user} />
            </div>
        </SidebarFooter>
    </>
  );
}
