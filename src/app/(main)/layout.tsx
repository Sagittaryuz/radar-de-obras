import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { UserNav } from '@/components/user-nav';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <MainSidebar user={session} />
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className='sm:hidden'>
              <SidebarTrigger />
            </div>
            <div className="ml-auto">
               {/* The UserNav is now in the sidebar footer as well */}
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
