
import { initializeApp, getApps, getApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error(
    'A variável de ambiente FIREBASE_SERVICE_ACCOUNT não está definida. Ela deve conter o JSON da chave de conta de serviço do Firebase.'
  );
}

let serviceAccount: ServiceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
  console.error('Falha ao analisar o JSON da conta de serviço:', error);
  throw new Error('O valor de FIREBASE_SERVICE_ACCOUNT não é um JSON válido.');
}

if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  throw new Error("O JSON da conta de serviço é inválido. Faltam propriedades essenciais como 'project_id', 'private_key', ou 'client_email'.");
}

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket: "jcr-radar.firebasestorage.app",
    })
  : getApp();

const auth = getAuth(adminApp);
const db = getFirestore(adminApp);
const storage = getStorage(adminApp);

export { adminApp, auth, db, storage };
