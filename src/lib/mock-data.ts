
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
  stage: 'Fundação' | 'Alvenaria' | 'Acabamento' | 'Pintura' | 'Telhado';
  status: 'Entrada' | 'Triagem' | 'Atribuída' | 'Em Negociação' | 'Ganha' | 'Perdida';
  sellerId: string | null;
};

export type Loja = {
  id: string;
  name: string;
  neighborhoods: string[];
};

export const users: User[] = [
  { id: 'user-1', name: 'Marcos Pires', email: 'marcos.pires@jcruzeiro.com', avatar: 'https://i.pravatar.cc/150?u=marcos.pires@jcruzeiro.com', role: 'Admin' },
  { id: 'user-2', name: 'Ana Silva', email: 'ana.silva@example.com', avatar: 'https://i.pravatar.cc/150?u=ana.silva@example.com', role: 'Vendedor' },
  { id: 'user-3', name: 'Carlos Santos', email: 'carlos.santos@example.com', avatar: 'https://i.pravatar.cc/150?u=carlos.santos@example.com', role: 'Vendedor' },
  { id: 'user-4', name: 'Sofia Ferreira', email: 'sofia.ferreira@example.com', avatar: 'https://i.pravatar.cc/150?u=sofia.ferreira@example.com', role: 'Vendedor' },
];

export const obras: Obra[] = [
  { id: 'obra-1', clientName: 'Construtora A', address: 'Rua das Flores, 123', stage: 'Fundação', status: 'Entrada', sellerId: null },
  { id: 'obra-2', clientName: 'Família Souza', address: 'Av. Principal, 456', stage: 'Alvenaria', status: 'Triagem', sellerId: null },
  { id: 'obra-3', clientName: 'Empresa B', address: 'Pç. Central, 789', stage: 'Acabamento', status: 'Atribuída', sellerId: 'user-2' },
  { id: 'obra-4', clientName: 'Sr. Roberto Lima', address: 'Al. dos Jardins, 101', stage: 'Fundação', status: 'Em Negociação', sellerId: 'user-3' },
  { id: 'obra-5', clientName: 'Condomínio Sol', address: 'Rua da Paz, 202', stage: 'Pintura', status: 'Ganha', sellerId: 'user-2' },
  { id: 'obra-6', clientName: 'Investimentos C', address: 'Av. do Progresso, 303', stage: 'Alvenaria', status: 'Perdida', sellerId: 'user-3' },
  { id: 'obra-7', clientName: 'Sra. Julia Mendes', address: 'Rua do Sol, 404', stage: 'Acabamento', status: 'Entrada', sellerId: null },
  { id: 'obra-8', clientName: 'Loja de Varejo D', address: 'Rua do Comércio, 505', stage: 'Telhado', status: 'Atribuída', sellerId: 'user-4' },
];

export const lojas: Loja[] = [
  { 
    id: 'loja-1', 
    name: 'Matriz', 
    neighborhoods: [
      'HAMOA', 'RES. PORTAL DO SOL 2ªETAPA', 'RES. PORTAL DO SOL 1ªETAPA', 'RESIDENCIAL IMPERIAL', 
      'JARDIM PARAÍSO', 'HAQUARELA', 'SETOR JARDIM GOIAS ll', 'SETOR JARDIM GOIAS', 'SETOR PARQUE BRITO', 
      'COHACOL 1', 'RESIDENCIAL MAURO BENTO', 'VILA MUTIRÃO', 'BAIRRO EPAMINONDAS 1', 'RESIDENCIAL BANDEIRANTES', 
      'BAIRRO SANTO ANTONIO', 'CONJUNTO RESIDENCIAL DR. DORIVAL DE CARVALHO', 'SETOR AEROPORTO', 'SETOR ANTENA', 
      'SETOR PLANALTO', 'SETOR SANTA LÚCIA', 'VILA IRACEMA', 'SETOR BELA VISTA', 'SETOR BELA VISTA 2', 
      'VILA CARLA', 'SETOR OESTE', 'SETOR GRANJEIRO', 'LOTEAMENTO JOSÉ FERREIRA', 'SETOR SAMUEL GRAHAM', 
      'SETOR DAS MANSÕES', 'BAIRRO PRIMAVERA 2', 'SETOR CYLLENEO FRANÇA', 'SETOR JOSÉ BENTO', 
      'CONJUNTO RIO CLARO 1', 'CONJUNTO RIO CLARO 2', 'CONJUNTO RIO CLARO 3', 'BAIRRO EPAMINONDAS 2'
    ] 
  },
  { 
    id: 'loja-2', 
    name: 'Catedral', 
    neighborhoods: [
      'SETOR SANTA MARIA', 'CENTRO', 'LOTEAMENTO JOÃO RODRIGUES DA CUNHA', 'VILA PROGRESSO', 'VILA OLAVO', 
      'LOT SANTA ROSA', 'LOTEAMENTO CARVALHO', 'VILA TRÊS MARIAS', 'BAIRRO PRIMAVERA', 'BENTA CAMPOS', 
      'SETOR CENTRAL PARTE BAIXA', 'VILA FREI DOMINGOS', 'VILA CAMPO NEUTRO', 'VILA SÃO PEDRO', 
      'RESIDENCIAL ALTO DAS ROSAS', 'SETOR JARDIM DA LIBERDADE', 'NOVA ESPERANÇA', 'VILA PALMEIRAS', 
      'SETOR COLINA', 'SETOR JACUTINGA', 'SETOR BRASÍLIA', 'JARDIM JATAÍ', 'CIDADE JARDIM', 
      'BAIRRO DOM BENEDITO'
    ] 
  },
  { 
    id: 'loja-3', 
    name: 'Said Abdala', 
    neighborhoods: [
      'VILA FÁTIMA', 'VILA PARAÍSO 1', 'VILA PARAÍSO 2', 'JARDIM MIXIMIANO', 'VILA JARDIM RIO CLARO', 
      'SETOR CORDEIRO', 'FERNANDES', 'BAIRRO HAMILTON NUNES', 'RESIDENCIAL ELDORADO', 'JARDIM AMÉRICA', 
      'VILA SOFIA', 'LOTEAMENTO SEBASTIÃO H. DE SOUZA', 'BAIRRO FRANCISCO ANTÔNIO', 'CONJUNTO ESTRELA D´ALVA', 
      'CONDOMÍNIO ITALIA', 'JARDIM FLORESTA', 'RESIDENCIAL SUL', 'RESIDENCIAL COHACOL 5', 'SETOR FABRINY', 
      'SETOR AIMBIRÉ', 'SETOR INDUSTRIAL', 'BAIRRO SODRÉ', 'BAIRRO POPULAR', 'BARCELONA', 
      'VILA MORADA DO SOL', 'SETOR HERMOSA', 'RESIDENCIAL DAS BRISAS 1', 'RESIDENCIAL DAS BRISAS 2', 
      'RESIDENCIAL DAS BRISAS 3'
    ] 
  },
];

// Mock async data fetching
export const getObras = async () => Promise.resolve(obras);
export const getUsers = async () => Promise.resolve(users);
export const getLojas = async () => Promise.resolve(lojas);
