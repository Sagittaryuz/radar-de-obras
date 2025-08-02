
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import type { User } from '@/lib/mock-data';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
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
