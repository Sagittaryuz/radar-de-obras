
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

    revalidatePath('/admin');
    revalidatePath('/regions');
    return { success: true };
  } catch (error) {
    console.error("Error updating neighborhoods:", error);
    return { error: 'Falha ao atualizar os bairros. Tente novamente.' };
  }
}

export async function updateObra(obraId: string, newData: Partial<Obra>) {
  console.log(`[Action: updateObra] Received request for obraId: ${obraId}`);
  console.log('[Action: updateObra] Received data for update:', newData);

  try {
    const obraRef = doc(dbAdmin, 'obras', obraId);
    const currentDocSnap = await getDoc(obraRef);

    if (!currentDocSnap.exists()) {
      console.error(`[Action: updateObra] Error: Obra with ID ${obraId} not found.`);
      return { error: 'Obra não encontrada.' };
    }
    const currentData = currentDocSnap.data() as Obra;
    console.log('[Action: updateObra] Current data in DB:', currentData);

    const updatePayload: Record<string, any> = {};

    // Compare line by line and build the payload
    for (const key in newData) {
      const typedKey = key as keyof Obra;
      if (newData[typedKey] !== currentData[typedKey]) {
        updatePayload[typedKey] = newData[typedKey];
      }
    }
    
    // If address components were changed, rebuild the full address field
    const wasAddressChanged = updatePayload.street || updatePayload.number || updatePayload.neighborhood;
    if (wasAddressChanged) {
        const newStreet = updatePayload.street || currentData.street;
        const newNumber = updatePayload.number || currentData.number;
        const newNeighborhood = updatePayload.neighborhood || currentData.neighborhood;
        updatePayload.address = `${newStreet}, ${newNumber}, ${newNeighborhood}`;
    }

    console.log('[Action: updateObra] Final payload for updateDoc:', updatePayload);

    if (Object.keys(updatePayload).length === 0) {
       console.log('[Action: updateObra] No changes detected. Skipping update.');
       return { success: true, data: { id: currentDocSnap.id, ...currentData } as Obra, message: "Nenhuma alteração foi feita." };
    }

    await updateDoc(obraRef, updatePayload);
    console.log('[Action: updateObra] updateDoc successful.');

    const updatedSnap = await getDoc(obraRef);
    const updatedData = { id: updatedSnap.id, ...updatedSnap.data() } as Obra;
    console.log('[Action: updateObra] Successfully fetched updated data to return:', updatedData);

    revalidatePath(`/obras/${obraId}`);
    revalidatePath('/obras');
    revalidatePath('/dashboard');
    console.log('[Action: updateObra] Revalidation complete. Returning success.');

    return { success: true, data: updatedData, message: "Os dados da obra foram atualizados com sucesso." };
  } catch (error) {
    console.error("[Action: updateObra] CATCH BLOCK: Error updating obra:", error);
    return { error: 'Falha ao atualizar a obra. Verifique os logs do servidor.' };
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
