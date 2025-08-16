
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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            // Determine the user's role. Grant 'Admin' if their email is in the admin list.
            const userRole: UserRole = ADMIN_EMAILS.includes(fbUser.email || '') ? 'Admin' : 'Vendedor';

            if (userDoc.exists()) {
              const existingUser = { id: userDoc.id, ...userDoc.data() } as User;
              // If the user is an admin but their role in DB is different, update it.
              if (userRole === 'Admin' && existingUser.role !== 'Admin') {
                  await setDoc(userDocRef, { role: 'Admin' }, { merge: true });
                  existingUser.role = 'Admin';
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
                    role: userRole, // Assign the determined role
                };
                await setDoc(userDocRef, newUser);
                setUser(newUser);
            }
        } catch (error) {
            console.error("Error fetching/creating user document from Firestore:", error);
            // Sign out the user if there is a critical error fetching their profile
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
    // Persistence is now set globally in firebase.ts
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    // Setting user to null immediately on logout for faster UI response
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
