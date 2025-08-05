
'use client';

import { useState, useEffect, memo } from 'react';
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

function InteractiveMapComponent({ address }: InteractiveMapProps) {
  const { toast } = useToast();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [center, setCenter] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!address) {
          setLoading(false);
          setCenter(null);
          return;
      }
      setLoading(true);
      try {
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
          setCenter(null);
        }
      } catch (error) {
        console.error('Geocoding API call error:', error);
        toast({
          variant: 'destructive',
          title: 'Erro de API',
          description: 'Falha ao se comunicar com o serviço de geocodificação.',
        });
        setCenter(null);
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address, toast]);

  if (loadError) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-destructive/10 rounded-md p-4 text-center">
            <p className="text-sm font-semibold text-destructive">Erro ao carregar o mapa.</p>
            <p className="text-xs text-destructive/80">Verifique se a "Maps JavaScript API" está ativada no seu projeto Google Cloud.</p>
        </div>
    );
  }
  
  if (!isLoaded || loading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!center) {
     return (
        <div className="flex items-center justify-center h-full bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Endereço não localizado.</p>
        </div>
     );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={16}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      <MarkerF position={center} />
    </GoogleMap>
  );
}

export const InteractiveMap = memo(InteractiveMapComponent);
