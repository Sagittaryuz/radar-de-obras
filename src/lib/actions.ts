
'use server';

import { revalidatePath } from 'next/cache';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Obra } from './mock-data';

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  initializeApp({
    projectId: "jcr-radar",
  });
}
const dbAdmin = getFirestore();

export async function updateLojaNeighborhoods(lojaId: string, neighborhoods: string[]) {
  try {
    const lojaRef = dbAdmin.collection('lojas').doc(lojaId);
    await lojaRef.update({ neighborhoods });

    revalidatePath('/admin');
    revalidatePath('/regions');
    return { success: true };
  } catch (error) {
    console.error("Error updating neighborhoods:", error);
    return { error: 'Falha ao atualizar os bairros. Tente novamente.' };
  }
}

export async function updateObra(obraId: string, payload: Partial<Obra>) {
  console.log(`[Action: updateObra] Received request for obraId: ${obraId}`);
  console.log('[Action: updateObra] Received payload from client:', payload);

  try {
    const obraRef = dbAdmin.collection('obras').doc(obraId);
    const docSnap = await obraRef.get();

    if (!docSnap.exists) {
      console.error(`[Action: updateObra] Error: Obra with ID ${obraId} not found.`);
      return { error: 'Obra não encontrada.' };
    }

    const currentData = docSnap.data() as Obra;
    console.log('[Action: updateObra] Current data in DB:', currentData);
    
    const updatePayload: Record<string, any> = {};

    // Compare payload from client with current data to find what changed
    (Object.keys(payload) as (keyof Partial<Obra>)[]).forEach(key => {
        if (payload[key] !== undefined && payload[key] !== currentData[key as keyof Obra]) {
            updatePayload[key] = payload[key];
        }
    });
    
    const addressFields: (keyof Partial<Obra>)[] = ['street', 'number', 'neighborhood'];
    const addressChanged = addressFields.some(field => field in updatePayload);

    if (addressChanged) {
        const newStreet = payload.street ?? currentData.street;
        const newNumber = payload.number ?? currentData.number;
        const newNeighborhood = payload.neighborhood ?? currentData.neighborhood;
        updatePayload.address = `${newStreet}, ${newNumber}, ${newNeighborhood}`;
    }

    if (Object.keys(updatePayload).length === 0) {
       console.log('[Action: updateObra] No changes detected. Skipping update.');
       const completeData = { ...currentData, id: docSnap.id } as Obra;
       return { success: true, data: completeData, message: "Nenhuma alteração foi feita." };
    }

    console.log('[Action: updateObra] Final payload for Firestore updateDoc:', updatePayload);

    await obraRef.update(updatePayload);
    console.log('[Action: updateObra] updateDoc successful.');

    const updatedSnap = await obraRef.get();
    const updatedData = { id: updatedSnap.id, ...updatedSnap.data() } as Obra;
    console.log('[Action: updateObra] Successfully fetched updated data to return:', updatedData);

    revalidatePath(`/obras/${obraId}`);
    revalidatePath('/obras');
    revalidatePath('/dashboard');
    console.log('[Action: updateObra] Revalidation complete. Returning success.');

    return { success: true, data: updatedData, message: "Os dados da obra foram atualizados com sucesso." };
  } catch (error) {
    console.error("[Action: updateObra] CATCH BLOCK: Error updating obra:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Falha ao atualizar a obra. Detalhes: ${errorMessage}` };
  }
}


export async function deleteObra(obraId: string) {
  try {
    const obraRef = dbAdmin.collection('obras').doc(obraId);
    await obraRef.delete();
    revalidatePath('/obras');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error deleting obra:", error);
    return { error: 'Falha ao excluir a obra. Tente novamente.' };
  }
}
