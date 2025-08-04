
'use server';

import { revalidatePath } from 'next/cache';
import { dbAdmin } from './firebase-admin';
import { doc, updateDoc } from 'firebase/firestore';

export async function updateLojaNeighborhoods(lojaId: string, neighborhoods: string[]) {
  try {
    const lojaRef = doc(dbAdmin, 'lojas', lojaId);
    await updateDoc(lojaRef, { neighborhoods });
    revalidatePath('/admin'); // Revalidate the admin page to show new data
    revalidatePath('/regions'); // Revalidate the regions page
    return { success: true };
  } catch (error) {
    console.error("Error updating neighborhoods:", error);
    return { error: 'Falha ao atualizar os bairros. Tente novamente.' };
  }
}
