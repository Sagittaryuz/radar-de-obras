
'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem', // Match card border radius
};

interface InteractiveMapProps {
  address: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export function InteractiveMap({ address }: InteractiveMapProps) {
  const { toast } = useToast();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [center, setCenter] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geocodeAddress = async () => {
      setLoading(true);
      try {
        // Using Nominatim as a free, no-key-required geocoding service
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            address
          )}&format=json&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
        } else {
          console.error(`Geocoding failed for address: ${address}`);
          toast({
            variant: 'destructive',
            title: 'Erro de Localização',
            description: 'Não foi possível encontrar as coordenadas para o endereço fornecido.',
          });
          setCenter(null); // Explicitly set to null on failure
        }
      } catch (error) {
        console.error('Geocoding API call error:', error);
        toast({
          variant: 'destructive',
          title: 'Erro de API',
          description: 'Falha ao se comunicar com o serviço de geocodificação.',
        });
        setCenter(null); // Explicitly set to null on failure
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address, toast]);

  if (loadError) {
    return <div>Erro ao carregar o mapa. Por favor, verifique a chave da API do Google Maps.</div>;
  }
  
  if (!isLoaded || loading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!center) {
     return <div className="flex items-center justify-center h-full bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">Endereço não localizado.</p>
     </div>
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={16}
    >
      <MarkerF position={center} />
    </GoogleMap>
  );
}
