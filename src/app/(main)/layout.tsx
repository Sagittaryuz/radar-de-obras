
'use client';

import { redirect, usePathname } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { UserNav } from '@/components/user-nav';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

function MainLayoutClient({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSession().then(session => {
            if (!session) {
                redirect('/login');
            } else {
                setUser(session);
                setLoading(false);
            }
        }).catch(() => {
            // Handle error case, e.g., redirect to login
            redirect('/login');
        });
    }, []);

    if (loading) {
        return (
             <div className="flex min-h-screen w-full bg-background">
                <div className="hidden md:block border-r p-2" style={{width: '16rem'}}>
                    <div className="flex flex-col gap-4">
                        <div className="p-2 flex items-center gap-2">
                             <Skeleton className="h-10 w-10 rounded-md" />
                             <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                             </div>
                        </div>
                         <div className="flex flex-col gap-2 px-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                         </div>
                    </div>
                </div>
                <div className="flex-1 p-6">
                    <Skeleton className="h-full w-full" />
                </div>
             </div>
        )
    }

    if (!user) {
        // This can happen briefly before redirect.
        // You can also show a full-screen loader here.
        return null; 
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


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayoutClient>{children}</MainLayoutClient>
}
