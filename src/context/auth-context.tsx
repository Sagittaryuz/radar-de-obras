
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Always start loading when auth state might change
      setLoading(true); 
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUser({ id: userDoc.id, ...userDoc.data() } as User);
            } else {
                // Handle case where user exists in Auth but not in Firestore
                setUser(null); 
                console.warn(`User with UID ${fbUser.uid} authenticated but no document found in Firestore.`);
            }
        } catch (error) {
            console.error("Error fetching user document from Firestore:", error);
            setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      // Finish loading only after all user data fetching is complete
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    // The onAuthStateChanged listener will handle the state update automatically.
    // We don't need to manually set loading states here.
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
  };
  
  const value = { user, firebaseUser, loading, login, logout };

  // Keep showing skeleton while the initial auth check is running.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
