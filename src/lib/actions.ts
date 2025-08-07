
'use server';

import { revalidatePath } from 'next/cache';
import { db as dbAdmin, storage as storageAdmin } from './firebase-admin';
import type { Obra, ObraContact } from './mock-data';
import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg';

export async function updateLojaNeighborhoods(lojaId: string, neighborhoods: string[]) {
  if (!dbAdmin) {
    return { error: 'Serviço de banco de dados indisponível.' };
  }
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

const ObraSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória."),
  number: z.string(), // Number can be empty
  neighborhood: z.string().min(1, "Bairro é obrigatório."),
  details: z.string().optional(),
  contacts: z.string().transform((val) => JSON.parse(val) as ObraContact[]).optional(),
  lojaId: z.string().min(1, "Unidade é obrigatória."),
  stage: z.enum(['Fundação', 'Alvenaria', 'Acabamento', 'Pintura', 'Telhado']),
  photoUrls: z.string().transform(val => JSON.parse(val) as string[]).optional(),
});


export async function addObra(formData: FormData) {
    if (!dbAdmin) {
      return { error: 'Serviço de banco de dados indisponível.' };
    }
    const rawData = {
        street: formData.get('street'),
        number: formData.get('number'),
        neighborhood: formData.get('neighborhood'),
        details: formData.get('details'),
        contacts: formData.get('contacts'),
        lojaId: formData.get('lojaId'),
        stage: formData.get('stage'),
        photoUrls: formData.get('photoUrls'),
    };

    const validatedFields = ObraSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Dados inválidos. Verifique os campos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { ...obraData } = validatedFields.data;

    try {
        const address = `${obraData.street}, ${obraData.number}, ${obraData.neighborhood}`;
        const newObraPayload = {
            ...obraData,
            clientName: address, 
            address: address,
            status: 'Entrada',
            sellerId: null,
            createdAt: new Date().toISOString(),
        };

        const docRef = await dbAdmin.collection('obras').add(newObraPayload);

        revalidatePath('/obras');
        revalidatePath('/dashboard');

        return { success: true, message: `Obra "${address}" criada com sucesso!`, id: docRef.id };

    } catch (error) {
        console.error("Error adding document: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { error: `Falha ao salvar a obra. Detalhes: ${errorMessage}` };
    }
}


export async function updateObra(obraId: string, payload: Partial<Obra>) {
  if (!dbAdmin) {
    return { error: 'Serviço de banco de dados indisponível.' };
  }
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
        const newAddress = `${newStreet}, ${newNumber}, ${newNeighborhood}`;
        updatePayload.address = newAddress;
        updatePayload.clientName = newAddress; // Update clientName as well
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
  if (!dbAdmin || !storageAdmin) {
    return { error: 'Serviço de banco de dados ou armazenamento indisponível.' };
  }
  try {
    const obraRef = dbAdmin.collection('obras').doc(obraId);
    const docSnap = await obraRef.get();
    if (docSnap.exists) {
        const data = docSnap.data() as Obra;
        if (data.photoUrls && data.photoUrls.length > 0) {
            const bucket = storageAdmin.bucket();
            for (const url of data.photoUrls) {
                try {
                    const urlObject = new URL(url);
                    // The actual path in the bucket is the pathname part of the URL, decoded and without the leading slash.
                    // For publicUrl(), the pathname is /<bucket-name>/<file-path>. We need to remove the bucket name part.
                    let filePath = decodeURIComponent(urlObject.pathname).substring(1);
                    
                    const bucketName = bucket.name;
                    // Remove the bucket name prefix if it exists in the path
                    if (filePath.startsWith(`${bucketName}/`)) {
                        filePath = filePath.substring(`${bucketName}/`.length);
                    }
                    
                    if (filePath) {
                        console.log(`Attempting to delete photo from storage: ${filePath}`);
                        await bucket.file(filePath).delete();
                        console.log(`Successfully deleted photo: ${filePath}`);
                    } else {
                         console.warn(`Could not extract a valid file path from URL: ${url}`);
                    }
                } catch (storageError) {
                    // Log the error but continue, so that DB deletion can proceed even if one photo fails.
                    console.error(`Failed to delete photo from storage: ${url}`, storageError);
                }
            }
        }
    }
    
    await obraRef.delete();
    revalidatePath('/obras');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error deleting obra:", error);
    return { error: 'Falha ao excluir a obra. Tente novamente.' };
  }
}


export async function getCoordinatesForAddress(address: string): Promise<{lat: number, lng: number} | null> {
    if (!address) return null;

    try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          return { lat, lng };
        } else {
          console.error(`[Server Action] Geocoding failed for address: ${address}`, data.status, data.error_message);
          return null;
        }
      } catch (error) {
        console.error('[Server Action] Geocoding API call error:', error);
        return null;
      }
}

// Since auth is mocked, we need a way to update the "user" profile.
// This will update the user record in Firestore. The mock getSession will
// need to be updated separately if we want the change to be reflected immediately.
export async function updateUser(userId: string, name: string, avatarDataUrl?: string) {
    if (!dbAdmin) {
      return { error: 'Serviço de banco de dados indisponível.' };
    }
    try {
        const userRef = dbAdmin.collection('users').doc(userId);
        const updateData: { name: string; avatar?: string } = { name };

        if (avatarDataUrl) {
            // This part is problematic in the current environment and is being moved to client-side.
            // For now, we will disable avatar updates from here to prevent token errors.
            console.log("Avatar update is handled client-side. Skipping server-side upload.");
        }

        await userRef.update({ name }); // Only update the name

        // We need to revalidate paths that show user info
        revalidatePath('/settings');
        revalidatePath('/(main)', 'layout');

        return { success: true };

    } catch (error) {
        console.error("Error updating user profile:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { error: `Falha ao atualizar o perfil. Detalhes: ${errorMessage}` };
    }
}
