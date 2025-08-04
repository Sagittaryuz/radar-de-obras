
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { dbAdmin } from './firebase-admin';

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

// Mock data has been removed. Data will now be fetched from Firestore.
export const users: User[] = [];
export const obras: Obra[] = [];
export const lojas: Loja[] = [];


// Functions to fetch data from Firestore
export async function getObras(): Promise<Obra[]> {
  const obrasCol = dbAdmin.collection('obras');
  const obrasSnapshot = await obrasCol.get();
  const obrasList = obrasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Obra));
  return obrasList;
}

export async function getUsers(): Promise<User[]> {
  const usersCol = dbAdmin.collection('users');
  const usersSnapshot = await usersCol.get();
  const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  return usersList;
}

export async function getLojas(): Promise<Loja[]> {
  const lojasCol = dbAdmin.collection('lojas');
  const lojasSnapshot = await lojasCol.get();
  const lojasList = lojasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Loja));
  return lojasList;
}
