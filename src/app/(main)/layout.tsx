
'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import type { User } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { redirect } from 'next/navigation';


function MainLayoutSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <div className="hidden md:block">
                 <div className="flex h-svh w-[16rem] flex-col p-2 gap-2">
                    <div className="p-2 border-b">
                        <Skeleton className="h-10 w-4/5" />
                    </div>
                    <div className="flex-1 p-2 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="p-2 border-t">
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
            <main className="flex-1 p-6">
                <Skeleton className="h-full w-full" />
            </main>
        </div>
    )
}


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadUser = async () => {
      const session = await getSession();
      if (!session) {
        redirect('/login');
      } else {
        setUser(session);
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading || !user) {
    return <MainLayoutSkeleton />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r hidden md:flex">
          <MainSidebar user={user} />
        </Sidebar>
        <div className="flex flex-col flex-1">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
            {children}
          </main>
          {isMobile && <MobileBottomNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}
