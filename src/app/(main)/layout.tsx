
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // This is the key change: only check for the user and redirect
    // once the initial loading is complete.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While loading, or if the user is not yet available (even after loading),
  // show the skeleton. This prevents the "flash" of the dashboard before redirecting.
  if (loading || !user) {
    return (
         <div className="flex min-h-screen w-full bg-background">
            <div className="border-r hidden md:flex flex-col p-4 space-y-4">
                <Skeleton className="h-12 w-48" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="flex-1 p-6">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    );
  }

  // Only render the main layout if loading is false AND the user exists.
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r hidden md:flex">
          <MainSidebar />
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
