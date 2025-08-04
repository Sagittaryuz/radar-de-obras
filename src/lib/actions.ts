
'use server';

import { revalidatePath } from 'next/cache';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, doc, updateDoc, deleteDoc, getDoc } from 'firebase-admin/firestore';
import type { Obra } from './mock-data';

// Server-side action still needs its own admin instance for writing
if (getApps().length === 0) {
  initializeApp();
}
const dbAdmin = getFirestore();


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

export async function updateObra(obraId: string, data: Partial<Obra>) {
  try {
    const obraRef = doc(dbAdmin, 'obras', obraId);

    // Get the existing document to merge the address fields
    const currentDocSnap = await getDoc(obraRef);
    if (!currentDocSnap.exists()) {
      return { error: 'Obra não encontrada.' };
    }
    const currentData = currentDocSnap.data() as Obra;

    // Merge new data with current data
    const newData = { ...currentData, ...data };

    // Build the full address on the server to ensure consistency,
    // using the merged data.
    newData.address = `${newData.street}, ${newData.number}, ${newData.neighborhood}`;
    
    // The data passed to updateDoc should only contain what's changed, plus the potentially updated address.
    const updatePayload = { ...data, address: newData.address };

    await updateDoc(obraRef, updatePayload);

    // Fetch the updated document to return the full object
    const updatedSnap = await getDoc(obraRef);
    if (!updatedSnap.exists()) {
        throw new Error("Document not found after update.");
    }
    const updatedData = { id: updatedSnap.id, ...updatedSnap.data() } as Obra;
    
    revalidatePath(`/obras/${obraId}`);
    revalidatePath('/obras');
    revalidatePath('/dashboard');
    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Error updating obra:", error);
    return { error: 'Falha ao atualizar a obra. Tente novamente.' };
  }
}

export async function deleteObra(obraId: string) {
  try {
    const obraRef = doc(dbAdmin, 'obras', obraId);
    await deleteDoc(obraRef);
    revalidatePath('/obras');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error deleting obra:", error);
    return { error: 'Falha ao excluir a obra. Tente novamente.' };
  }
}
