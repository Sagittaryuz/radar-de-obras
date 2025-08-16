
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Building2, LayoutDashboard, ListTodo, Map, Settings, DollarSign, LogOut } from 'lucide-react';
import Link from 'next/link';
import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';


const baseMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/obras', label: 'Obras', icon: ListTodo },
  { href: '/regions', label: 'Regiões', icon: Map },
  { href: '/receitas', label: 'Receitas', icon: DollarSign },
];

const adminMenuItem = { href: '/admin', label: 'Admin', icon: Settings };
const adminEmails = ['marcos.pires@jcruzeiro.com', 'willian.mota@jcruzeiro.com'];


function getInitials(name: string) {
    if (!name) return '...';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}


export function MainSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const menuItems = user?.role === 'Admin' && adminEmails.includes(user.email) 
    ? [...baseMenuItems, adminMenuItem] 
    : baseMenuItems;

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 p-2">
             <Image
                src="https://i.imgur.com/RI2eag9.png"
                alt="Radar de Obras Logo"
                width={40}
                height={40}
                className="rounded-md"
            />
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
      <SidebarSeparator />
        <SidebarFooter>
            {user && (
                 <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name}/>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col truncate">
                        <span className="font-semibold text-sm truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                     <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                        <LogOut className="h-5 w-5"/>
                    </Button>
                </div>
            )}
        </SidebarFooter>
    </>
  );
}
