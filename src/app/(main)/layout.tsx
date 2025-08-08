
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getUserByEmail } from '@/lib/mock-data';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import type { User } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { redirect, usePathname } from 'next/navigation';


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
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get our custom user data.
        const appUser = await getUserByEmail(firebaseUser.email!);
        if (appUser) {
          setUser(appUser);
        } else {
          // This case should ideally not happen if Firestore is synced with Auth
          console.error("User exists in Firebase Auth but not in Firestore.");
          setUser(null);
          if (pathname !== '/login') {
            redirect('/login');
          }
        }
      } else {
        // User is signed out.
        setUser(null);
        if (pathname !== '/login') {
          redirect('/login');
        }
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [pathname]);

  if (loading) {
    return <MainLayoutSkeleton />;
  }
  
  if (!user) {
    // If not loading and no user, we should be on the login page.
    // The redirect in useEffect handles this, but this is a fallback.
    return null; 
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
