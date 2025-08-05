
'use server';

import { revalidatePath } from 'next/cache';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { Obra, User } from './mock-data';
import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg';


// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  initializeApp({
    projectId: "jcr-radar",
    storageBucket: "jcr-radar.firebasestorage.app",
  });
}
const dbAdmin = getFirestore();
const storageAdmin = getStorage();

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

const ObraSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório."),
  contactPhone: z.string().optional(),
  street: z.string().min(1, "Rua é obrigatória."),
  number: z.string().min(1, "Número é obrigatório."),
  neighborhood: z.string().min(1, "Bairro é obrigatório."),
  lojaId: z.string().min(1, "Unidade é obrigatória."),
  stage: z.enum(['Fundação', 'Alvenaria', 'Acabamento', 'Pintura', 'Telhado']),
  photoDataUrl: z.string().optional(),
});


export async function addObra(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());

    const validatedFields = ObraSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Dados inválidos. Verifique os campos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { photoDataUrl, ...obraData } = validatedFields.data;
    let finalPhotoUrl = '';

    try {
        if (photoDataUrl) {
            const matches = photoDataUrl.match(/^data:(.+);base64,(.+)$/);
            if (!matches) {
                throw new Error("Formato de imagem inválido.");
            }
            
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `obras/${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const file = storageAdmin.bucket().file(fileName);

            await file.save(buffer, {
                metadata: { contentType: mimeType },
                public: true, // Make file publicly readable
            });

            // The public URL format is https://storage.googleapis.com/<bucket-name>/<file-path>
            finalPhotoUrl = `https://storage.googleapis.com/${storageAdmin.bucket().name}/${fileName}`;
        }

        const newObraPayload = {
            ...obraData,
            address: `${obraData.street}, ${obraData.number}, ${obraData.neighborhood}`,
            status: 'Entrada',
            sellerId: null,
            photoUrls: finalPhotoUrl ? [finalPhotoUrl] : [],
            createdAt: new Date().toISOString(),
        };

        const docRef = await dbAdmin.collection('obras').add(newObraPayload);

        revalidatePath('/obras');
        revalidatePath('/dashboard');

        return { success: true, message: `Obra "${obraData.clientName}" criada com sucesso!`, id: docRef.id };

    } catch (error) {
        console.error("Error adding document: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { error: `Falha ao salvar a obra. Detalhes: ${errorMessage}` };
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
    const docSnap = await obraRef.get();
    if (docSnap.exists) {
        const data = docSnap.data() as Obra;
        if (data.photoUrls && data.photoUrls.length > 0) {
            const bucket = storageAdmin.bucket();
            for (const url of data.photoUrls) {
                try {
                    const urlObject = new URL(url);
                    const decodedPath = decodeURIComponent(urlObject.pathname);
                    const bucketName = `/${storageAdmin.bucket().name}/`;
                    if (decodedPath.startsWith(bucketName)) {
                        const filePath = decodedPath.substring(bucketName.length);
                        console.log(`Attempting to delete photo from storage: ${filePath}`);
                        if (filePath) {
                            await bucket.file(filePath).delete();
                            console.log(`Successfully deleted photo: ${filePath}`);
                        }
                    } else {
                        console.warn(`Could not extract file path from URL: ${url}`);
                    }
                } catch (storageError) {
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

export async function updateUserProfile(userId: string, name: string, avatarDataUrl?: string) {
    try {
        const userRef = dbAdmin.collection('users').doc(userId);
        const updateData: { name: string; avatar?: string } = { name };

        if (avatarDataUrl) {
            const matches = avatarDataUrl.match(/^data:(.+);base64,(.+)$/);
            if (!matches) {
                throw new Error("Formato de imagem de avatar inválido.");
            }
            
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `avatars/${userId}-${Date.now()}.jpg`;
            const file = storageAdmin.bucket().file(fileName);

            await file.save(buffer, {
                metadata: { contentType: mimeType },
                public: true,
            });

            updateData.avatar = `https://storage.googleapis.com/${storageAdmin.bucket().name}/${fileName}`;
        }

        await userRef.update(updateData);

        revalidatePath('/settings');
        return { success: true, updatedAvatarUrl: updateData.avatar };

    } catch (error) {
        console.error("Error updating user profile:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { error: `Falha ao atualizar o perfil. Detalhes: ${errorMessage}` };
    }
}
