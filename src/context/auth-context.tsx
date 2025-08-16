
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/mock-data';

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
    // Ensure persistence is set before onAuthStateChanged is triggered.
    setPersistence(auth, browserSessionPersistence).then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            setFirebaseUser(fbUser);
            try {
                const userDocRef = doc(db, 'users', fbUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  setUser({ id: userDoc.id, ...userDoc.data() } as User);
                } else {
                    // This case handles a valid Firebase user that doesn't have a profile in Firestore.
                    console.error("Firebase user exists, but no user profile found in Firestore.");
                    setUser(null); 
                }
            } catch (error) {
                console.error("Error fetching user document from Firestore:", error);
                setUser(null);
            }
          } else {
            // This case handles when the user is logged out.
            setFirebaseUser(null);
            setUser(null);
          }
          // Only stop loading after all async operations are done.
          setLoading(false);
        });
        return () => unsubscribe();
    }).catch((error) => {
        console.error("Error setting auth persistence:", error);
        setLoading(false); // Stop loading even if persistence fails.
    });

  }, []);

  const login = async (email: string, pass: string) => {
    // The loading state is managed by the onAuthStateChanged listener,
    // so we don't need to set it here.
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    // The onAuthStateChanged listener will handle clearing the user state.
  };
  
  const value = { user, firebaseUser, loading, login, logout };

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
