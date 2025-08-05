
import { db } from './firebase'; // Use the client instance for all data fetching
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

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
  photoUrls?: string[];
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

const hardcodedLojas: Loja[] = [
    {
        id: 'catedral',
        name: 'CATEDRAL',
        neighborhoods: [
            "SETOR SANTA MARIA", "CENTRO", "LOTEAMENTO JOÃO RODRIGUES DA CUNHA", "VILA PROGRESSO",
            "VILA OLAVO", "LOT SANTA ROSA", "LOTEAMENTO CARVALHO", "VILA TRÊS MARIAS", "BAIRRO PRIMAVERA",
            "BENTA CAMPOS", "SETOR CENTRAL PARTE BAIXA", "VILA FREI DOMINGOS", "VILA CAMPO NEUTRO",
            "VILA SÃO PEDRO", "RESIDENCIAL ALTO DAS ROSAS", "SETOR JARDIM DA LIBERDADE", "NOVA ESPERANÇA",
            "VILA PALMEIRAS", "SETOR COLINA", "SETOR JACUTINGA", "SETOR BRASÍLIA", "JARDIM JATAÍ",
            "CIDADE JARDIM", "BAIRRO DOM BENEDITO"
        ]
    },
    {
        id: 'matriz',
        name: 'MATRIZ',
        neighborhoods: [
            "HAMOA RES. PORTAL DO SOL 2ªETAPA", "RES. PORTAL DO SOL 1ªETAPA", "RESIDENCIAL IMPERIAL",
            "JARDIM PARAÍSO", "HAQUARELA", "SETOR JARDIM GOIAS ll", "SETOR JARDIM GOIAS", "SETOR PARQUE BRITO",
            "COHACOL 1", "RESIDENCIAL MAURO BENTO", "VILA MUTIRÃO", "BAIRRO EPAMINONDAS 1", "RESIDENCIAL BANDEIRANTES",
            "BAIRRO SANTO ANTONIO", "CONJUNTO RESIDENCIAL DR. DORIVAL DE CARVALHO", "SETOR AEROPORTO",
            "SETOR ANTENA", "SETOR PLANALTO", "SETOR SANTA LÚCIA", "VILA IRACEMA", "SETOR BELA VISTA",
            "SETOR BELA VISTA 2", "VILA CARLA", "SETOR OESTE", "SETOR GRANJEIRO", "LOTEAMENTO JOSÉ FERREIRA",
            "SETOR SAMUEL GRAHAM", "SETOR DAS MANSÕES", "BAIRRO PRIMAVERA 2", "SETOR CYLLENEO FRANÇA",
            "SETOR JOSÉ BENTO", "CONJUNTO RIO CLARO 1", "CONJUNTO RIO CLARO 2", "CONJUNTO RIO CLARO 3",
            "BAIRRO EPAMINONDAS 2"
        ]
    },
    {
        id: 'said-abdala',
        name: 'SAID ABDALA',
        neighborhoods: [
            "VILA FÁTIMA", "VILA PARAÍSO 1", "VILA PARAÍSO 2", "JARDIM MIXIMIANO", "VILA JARDIM RIO CLARO",
            "SETOR CORDEIRO FERNANDES", "BAIRRO HAMILTON NUNES", "RESIDENCIAL ELDORADO", "JARDIM AMÉRICA",
            "SETOR CORDEIRO", "VILA SOFIA", "LOTEAMENTO SEBASTIÃO H. DE SOUZA", "BAIRRO FRANCISCO ANTÔNIO",
            "CONJUNTO ESTRELA D´ALVA", "CONDOMÍNIO ITALIA", "JARDIM FLORESTA", "RESIDENCIAL SUL",
            "RESIDENCIAL COHACOL 5", "SETOR FABRINY", "SETOR AIMBIRÉ", "SETOR INDUSTRIAL", "BAIRRO SODRÉ",
            "BAIRRO POPULAR", "BARCELONA", "VILA MORADA DO SOL", "SETOR HERMOSA", "RESIDENCIAL DAS BRISAS 1",
            "RESIDENCIAL DAS BRISAS 2", "RESIDENCIAL DAS BRISAS 3"
        ]
    }
];


// These functions will now be called from client components
export async function getObras(): Promise<Obra[]> {
  try {
    const obrasCol = collection(db, 'obras');
    const obrasSnapshot = await getDocs(obrasCol);
    const obrasList = obrasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Obra));
    return obrasList;
  } catch (error) {
    console.error("Error fetching obras from client:", error);
    return [];
  }
}

export async function getObraById(id: string): Promise<Obra | null> {
    console.log(`[getObraById] Fetching obra with ID: ${id}`);
    try {
        const obraRef = doc(db, 'obras', id);
        const obraSnap = await getDoc(obraRef);
        if (obraSnap.exists()) {
            return { id: obraSnap.id, ...obraSnap.data() } as Obra;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching obra by ID:", error);
        return null;
    }
}

export async function getUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCol);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return usersList;
  } catch (error) {
    console.error("Error fetching users from client:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
    try {
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() } as User;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null;
    }
}


export async function getLojas(): Promise<Loja[]> {
  try {
    const lojasCol = collection(db, 'lojas');
    const lojasSnapshot = await getDocs(lojasCol);
    
    if (lojasSnapshot.empty) {
        return hardcodedLojas;
    }

    const lojasList = lojasSnapshot.docs.map(doc => {
        const data = doc.data();
        // Use the name from firestore, and neighborhoods from firestore if they exist and are not empty
        return {
            id: doc.id,
            name: data.name || doc.id,
            neighborhoods: (data.neighborhoods && data.neighborhoods.length > 0) 
                           ? data.neighborhoods 
                           : []
        } as Loja
    });
    return lojasList;
  } catch (error) {
    console.error("Error fetching lojas from client:", error);
    // Fallback to hardcoded data on error
    return hardcodedLojas;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error("Error fetching user by email from client:", error);
    return null;
  }
}
