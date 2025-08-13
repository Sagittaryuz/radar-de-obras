
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

function FullPageLoader() {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="space-y-4 text-center">
                 <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                 <Skeleton className="h-8 w-48" />
                 <p className="text-muted-foreground">Verificando sua sessão...</p>
            </div>
        </div>
    );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login page.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // While loading, show a full-page loader or a skeleton screen.
  if (loading) {
    return <FullPageLoader />;
  }
  
  // If user is authenticated, render the main layout.
  if (user) {
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
  
  // Fallback in case user is null after loading (should be covered by useEffect)
  return null;
}
