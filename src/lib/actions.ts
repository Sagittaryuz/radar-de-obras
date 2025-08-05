
'use server';

import { revalidatePath } from 'next/cache';
import { initializeApp, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore, doc, updateDoc, getDoc, deleteDoc } from 'firebase-admin/firestore';
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
      Object.keys(formData).forEach(key => {
        const typedKey = key as keyof Partial<Obra>;
        if (formData[typedKey] !== undefined && formData[typedKey] !== currentData[typedKey]) {
          updatePayload[typedKey] = formData[typedKey];
        }
      });
      
      console.log('[Action: updateObra] Detected changes (before address check):', updatePayload);
  
      // If any address component was changed, rebuild the full address field
      const addressChanged = 'street' in updatePayload || 'number' in updatePayload || 'neighborhood' in updatePayload;
      
      if (addressChanged) {
          const newStreet = formData.street ?? currentData.street;
          const newNumber = formData.number ?? currentData.number;
          const newNeighborhood = formData.neighborhood ?? currentData.neighborhood;
          const newAddress = `${newStreet}, ${newNumber}, ${newNeighborhood}`;
  
          // Only add the address to the payload if it actually changed
          if (newAddress !== currentData.address) {
             updatePayload.address = newAddress;
             console.log(`[Action: updateObra] Address was changed. New address: ${newAddress}`);
          }
      }
  
      if (Object.keys(updatePayload).length === 0) {
         console.log('[Action: updateObra] No changes detected. Skipping update.');
         // We still return the full data to the client callback
         const completeData = { id: currentDocSnap.id, ...currentData } as Obra;
         return { success: true, data: completeData, message: "Nenhuma alteração foi feita." };
      }
  
      console.log('[Action: updateObra] Final payload for Firestore updateDoc:', updatePayload);
  
      await updateDoc(obraRef, updatePayload);
      console.log('[Action: updateObra] updateDoc successful.');
  
      // Fetch the updated document to return the latest state
      const updatedSnap = await getDoc(obraRef);
      const updatedData = { id: updatedSnap.id, ...updatedSnap.data() } as Obra;
      console.log('[Action: updateObra] Successfully fetched updated data to return:', updatedData);
  
      // Revalidate paths to ensure data is fresh across the app
      revalidatePath(`/obras/${obraId}`);
      revalidatePath('/obras');
      revalidatePath('/dashboard');
      console.log('[Action: updateObra] Revalidation complete. Returning success.');
  
      return { success: true, data: updatedData, message: "Os dados da obra foram atualizados com sucesso." };
    } catch (error) {
      console.error("[Action: updateObra] CATCH BLOCK: Error updating obra:", error);
      // It's helpful to know what kind of error it was
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
