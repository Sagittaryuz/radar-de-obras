
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ListTodo, Map, DollarSign, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const baseMenuItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/obras', label: 'Obras', icon: ListTodo },
  { href: '/regions', label: 'Regiões', icon: Map },
  { href: '/receitas', label: 'Receitas', icon: DollarSign },
];

const adminMenuItem = { href: '/admin', label: 'Admin', icon: Settings };

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = user?.role === 'Admin' 
    ? [...baseMenuItems, adminMenuItem]
    : baseMenuItems;
  
  const gridColsClass = menuItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border md:hidden">
      <div className={cn("grid h-full max-w-lg mx-auto font-medium", gridColsClass)}>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-muted group",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
