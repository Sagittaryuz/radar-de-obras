
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User, UserRole } from '@/lib/firestore-data';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['marcos.pires@jcruzeiro.com', 'mrpires72@gmail.com'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- Cache Busting Logic ---
    // This forces a hard reload once per session to ensure users get the latest version
    // of the application, preventing errors from outdated cached assets.
    if (typeof window !== 'undefined') {
      const hasReloaded = sessionStorage.getItem('hasReloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('hasReloaded', 'true');
        window.location.reload();
        // Return early to prevent the rest of the effect from running on the old code
        return;
      }
    }
    // ---------------------------

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            let userRole: UserRole = 'Vendedor'; // Default role
            if (fbUser.email && ADMIN_EMAILS.includes(fbUser.email)) {
                userRole = 'Admin';
            } else if (userDoc.exists()) {
                // If not an admin by email, use the role from the database
                userRole = userDoc.data().role || 'Vendedor';
            }
            
            if (userDoc.exists()) {
              const existingUser = { id: userDoc.id, ...userDoc.data() } as User;
              // If the user is an admin (by email) but their role in DB is different, update it.
              if (userRole === 'Admin' && existingUser.role !== 'Admin') {
                  await setDoc(userDocRef, { role: 'Admin' }, { merge: true });
                  existingUser.role = 'Admin'; // Update local object as well
              }
              setUser(existingUser);
            } else {
                // If user exists in Auth but not Firestore, create them.
                console.warn("User profile not found in Firestore, creating one.");
                const newUser: User = {
                    id: fbUser.uid,
                    name: fbUser.displayName || fbUser.email || 'Novo Usuário',
                    email: fbUser.email!,
                    avatar: fbUser.photoURL || `https://i.imgur.com/RI2eag9.png`,
                    role: userRole, 
                };
                await setDoc(userDocRef, newUser);
                setUser(newUser);
            }
        } catch (error) {
            console.error("Error fetching/creating user document from Firestore:", error);
            await signOut(auth);
            setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null); 
    setFirebaseUser(null);
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
