
import { getFirestore } from 'firebase-admin/firestore';
import { dbAdmin } from './firebase-admin'; // Use the admin instance for server-side fetching

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Vendedor' | 'Admin';
};

export type Obra = {
  id: string;
  clientName: string;
  address: string;
  street: string;
  number: string;
  neighborhood: string;
  contactPhone?: string;
  photoUrl?: string;
  gmapsUrl?: string;
  lojaId: string;
  stage: 'Fundação' | 'Alvenaria' | 'Acabamento' | 'Pintura' | 'Telhado';
  status: 'Entrada' | 'Triagem' | 'Atribuída' | 'Em Negociação' | 'Ganha' | 'Perdida';
  sellerId: string | null;
};

export type Loja = {
  id: string;
  name: string;
  neighborhoods: string[];
};

// These functions run on the server, so they should use the admin DB instance.
export async function getObras(): Promise<Obra[]> {
  try {
    const db = getFirestore();
    const obrasCol = db.collection('obras');
    const obrasSnapshot = await obrasCol.get();
    const obrasList = obrasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Obra));
    return obrasList;
  } catch (error) {
    console.error("Error fetching obras:", error);
    return [];
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const db = getFirestore();
    const usersCol = db.collection('users');
    const usersSnapshot = await usersCol.get();
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return usersList;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getLojas(): Promise<Loja[]> {
  try {
    const db = getFirestore();
    const lojasCol = db.collection('lojas');
    const lojasSnapshot = await lojasCol.get();
    const lojasList = lojasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Loja));
    return lojasList;
  } catch (error) {
    console.error("Error fetching lojas:", error);
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = getFirestore();
    const usersRef = db.collection('users');
    const q = usersRef.where('email', '==', email);
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}
