
'use server';

import { revalidatePath } from 'next/cache';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, doc, updateDoc, getDoc, deleteDoc } from 'firebase-admin/firestore';
import type { Obra } from './mock-data';

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

export async function updateObra(obraId: string, formData: Partial<Obra>) {
  console.log(`[Action: updateObra] Received request for obraId: ${obraId}`);
  console.log('[Action: updateObra] Received form data:', formData);

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

    // Compare form data with current data to find what changed
    (Object.keys(formData) as (keyof Partial<Obra>)[]).forEach(key => {
        // Ensure we handle undefined or null values from the form correctly.
        const formValue = formData[key];
        const currentValue = currentData[key as keyof Obra];
        
        // Add to payload if the form value is different from the current value.
        // This handles changes from a value to an empty string, but not the other way if the form sends undefined.
        if (formValue !== undefined && formValue !== currentValue) {
            updatePayload[key] = formValue;
        }
    });
    
    // Check if the address needs to be reconstructed
    const addressFields = ['street', 'number', 'neighborhood'];
    const addressChanged = addressFields.some(field => field in updatePayload);

    if (addressChanged) {
        // Reconstruct the full address using new data, falling back to old data if a field wasn't changed.
        const newStreet = formData.street ?? currentData.street;
        const newNumber = formData.number ?? currentData.number;
        const newNeighborhood = formData.neighborhood ?? currentData.neighborhood;
        const newAddress = `${newStreet}, ${newNumber}, ${newNeighborhood}`;

        // Only add the address to the payload if it has actually changed.
        if (newAddress !== currentData.address) {
           updatePayload.address = newAddress;
        }
    }

    if (Object.keys(updatePayload).length === 0) {
       console.log('[Action: updateObra] No changes detected. Skipping update.');
       const completeData = { id: currentDocSnap.id, ...currentData } as Obra;
       return { success: true, data: completeData, message: "Nenhuma alteração foi feita." };
    }

    console.log('[Action: updateObra] Final payload for Firestore updateDoc:', updatePayload);

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Falha ao atualizar a obra. Detalhes: ${errorMessage}` };
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
