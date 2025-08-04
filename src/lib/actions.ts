
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
  console.log(`[Action: updateObra] Received request for obraId: ${obraId}`);
  console.log('[Action: updateObra] Received data for update:', data);

  try {
    const obraRef = doc(dbAdmin, 'obras', obraId);

    const currentDocSnap = await getDoc(obraRef);
    if (!currentDocSnap.exists()) {
      console.error(`[Action: updateObra] Error: Obra with ID ${obraId} not found.`);
      return { error: 'Obra não encontrada.' };
    }
    const currentData = currentDocSnap.data() as Obra;
    console.log('[Action: updateObra] Current data found:', currentData);
    
    // Merge new data with existing data to ensure we have all fields for address reconstruction
    const mergedData = { ...currentData, ...data };
    
    // Always reconstruct the address field to ensure consistency
    const newAddress = `${mergedData.street}, ${mergedData.number}, ${mergedData.neighborhood}`;

    // Prepare the final payload for Firestore. Start with the data from the client.
    const updatePayload: Partial<Obra> = { ...data };

    // If the newly constructed address is different from the old one, add it to the payload.
    if (newAddress !== currentData.address) {
      updatePayload.address = newAddress;
    }
    
    console.log('[Action: updateObra] Final payload for updateDoc:', updatePayload);
    
    if (Object.keys(updatePayload).length === 0) {
       console.log('[Action: updateObra] No changes detected. Skipping update.');
       // Return the most up-to-date data.
       const finalSnap = await getDoc(obraRef);
       return { success: true, data: { id: finalSnap.id, ...finalSnap.data() } as Obra };
    }

    await updateDoc(obraRef, updatePayload);
    console.log('[Action: updateObra] updateDoc successful.');

    const updatedSnap = await getDoc(obraRef);
    if (!updatedSnap.exists()) {
        console.error("[Action: updateObra] CRITICAL: Document not found after update.");
        throw new Error("Document not found after update.");
    }
    const updatedData = { id: updatedSnap.id, ...updatedSnap.data() } as Obra;
    console.log('[Action: updateObra] Successfully fetched updated data to return:', updatedData);

    
    revalidatePath(`/obras/${obraId}`);
    revalidatePath('/obras');
    revalidatePath('/dashboard');
    console.log('[Action: updateObra] Revalidation complete. Returning success.');

    return { success: true, data: updatedData };
  } catch (error) {
    console.error("[Action: updateObra] CATCH BLOCK: Error updating obra:", error);
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
