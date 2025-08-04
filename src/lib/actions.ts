
'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore } from 'firebase-admin/firestore';
import { dbAdmin } from './firebase-admin';

export async function updateLojaNeighborhoods(lojaId: string, neighborhoods: string[]) {
  try {
    const db = getFirestore(dbAdmin);
    const lojaRef = db.collection('lojas').doc(lojaId);
    await lojaRef.update({ neighborhoods });

    revalidatePath('/admin'); // Revalidate the admin page to show new data
    revalidatePath('/regions'); // Revalidate the regions page
    return { success: true };
  } catch (error) {
    console.error("Error updating neighborhoods:", error);
    return { error: 'Falha ao atualizar os bairros. Tente novamente.' };
  }
}
