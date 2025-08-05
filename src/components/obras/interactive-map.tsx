
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

const InteractiveMapComponent = memo(function InteractiveMapComponent({ address }: InteractiveMapProps) {
  const { toast } = useToast();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['geocoding'], // Ensure geocoding library is loaded
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
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setCenter({ lat, lng });
        } else {
          console.error(`Geocoding failed for address: ${address}`, data.status, data.error_message);
          if (data.status !== 'ZERO_RESULTS') {
            toast({
              variant: 'destructive',
              title: 'Erro de Localização',
              description: data.error_message || 'Não foi possível encontrar as coordenadas para o endereço fornecido.',
            });
          }
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

    if (isLoaded) {
      geocodeAddress();
    }
  }, [address, toast, isLoaded]);

  if (loadError) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-destructive/10 rounded-md p-4 text-center">
            <p className="text-sm font-semibold text-destructive">Erro ao carregar o script do mapa.</p>
            <p className="text-xs text-destructive/80">Verifique a console do navegador e as configurações da sua chave de API no Google Cloud.</p>
        </div>
    );
  }
  
  if (!isLoaded || loading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!center) {
     return (
        <div className="flex items-center justify-center h-full bg-muted rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">Endereço não localizado ou inválido.</p>
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
});

export { InteractiveMapComponent as InteractiveMap };
