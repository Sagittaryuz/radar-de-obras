
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import type { User } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';


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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        // Allow unauthenticated access only to login page which is not under this layout
        // For any other page, redirect to login.
        if (pathname !== '/login') {
            router.push('/login');
        } else {
            setLoading(false);
        }
      } else {
        setUser(session);
        setLoading(false);
      }
    };
    checkSession();
  }, [router, pathname]);

  if (loading) {
    return <MainLayoutSkeleton />;
  }
  
  if (!user) {
    // This case handles the brief moment before the redirect happens,
    // or if the user somehow lands here without a session.
    return <MainLayoutSkeleton />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <MainSidebar user={user} />
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className='sm:hidden'>
              <SidebarTrigger />
            </div>
            <div className="ml-auto">
              {/* Future header content can go here, like a user nav for mobile */}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 pt-0 sm:p-6 sm:pt-0">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
