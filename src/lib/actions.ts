
'use server';

import { revalidatePath } from 'next/cache';
import type { Loja } from './firestore-data';


const GOOGLE_MAPS_API_KEY = 'AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg';

export async function imageToDataUrl(url: string) {
    try {
        // This server action now fetches the image on the server-side,
        // which can help in environments where client-side fetching is restricted.
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const dataUrl = `data:${blob.type};base64,${buffer.toString('base64')}`;
        return { success: true, dataUrl };
    } catch (error) {
        console.error("Error converting image to data URL:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
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
