
'use client';

import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

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
