
'use client';

import { memo } from 'react';
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
  coordinates: { lat: number; lng: number } | null;
}

// Define libraries array outside of the component to prevent re-creation on re-renders.
const libraries: ('geocoding' | 'maps')[] = ['geocoding'];

const InteractiveMapComponent = memo(function InteractiveMapComponent({ coordinates }: InteractiveMapProps) {
  const { toast } = useToast();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries, 
  });

  if (loadError) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-destructive/10 rounded-md p-4 text-center">
            <p className="text-sm font-semibold text-destructive">Erro ao carregar o script do mapa.</p>
            <p className="text-xs text-destructive/80">Verifique a console do navegador e as configurações da sua chave de API no Google Cloud.</p>
        </div>
    );
  }
  
  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!coordinates) {
     return (
        <div className="flex items-center justify-center h-full bg-muted rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">Endereço não localizado ou inválido.</p>
        </div>
     );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={coordinates}
      zoom={16}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      <MarkerF position={coordinates} />
    </GoogleMap>
  );
});

export { InteractiveMapComponent as InteractiveMap };
