
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { getObraById, getUserById, getLojas } from '@/lib/mock-data';
import type { Obra, User, Loja } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, MapPin, Phone, Building, Wrench, Home, Hash, Briefcase, Edit, Trash2, Camera, PhoneCall, AlignLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EditObraDialog } from '@/components/obras/edit-obra-dialog';
import { DeleteObraDialog } from '@/components/obras/delete-obra-dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { InteractiveMap } from '@/components/obras/interactive-map';
import { getCoordinatesForAddress } from '@/lib/actions';

interface Coordinates {
    lat: number;
    lng: number;
}


function ObraDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                         <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                         <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function ObraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const obraId = params.id as string;

  const [obra, setObra] = useState<Obra | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  // This function will be called by the dialog on successful update to refresh the page data.
  const handleSuccess = () => {
    // Re-trigger the data fetching to get the latest data.
    fetchData();
  };

  const fetchData = async () => {
    if (!obraId) return;
    setLoading(true);
    try {
      console.log(`[getObraById] Fetching obra with ID: ${obraId}`);
      const [obraData, lojasData] = await Promise.all([
          getObraById(obraId),
          getLojas()
      ]);
      
      if (obraData) {
        setObra(obraData);
        setLojas(lojasData);
        
        if (obraData.address) {
            const coords = await getCoordinatesForAddress(obraData.address);
            setCoordinates(coords);
        }

        if (obraData.sellerId) {
          const sellerData = await getUserById(obraData.sellerId);
          setSeller(sellerData);
        }
      } else {
         notFound();
      }
    } catch (error) {
      console.error("Failed to fetch obra details:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [obraId]); // Removed router from dependency array, it's stable

  if (loading) {
    return <ObraDetailSkeleton />;
  }

  if (!obra) {
    // This will be caught by the notFound() in a real app,
    // but client-side we can just show a message.
    return <div>Obra não encontrada.</div>;
  }
  
  const lojaName = lojas.find(l => l.id === obra.lojaId)?.name || obra.lojaId;
  const isOldDataFormat = !obra.contacts || obra.contacts.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="font-headline text-3xl font-bold tracking-tight">
            Detalhes da Obra
         </h1>
         <div className="flex items-center gap-2">
            <EditObraDialog obra={obra} onSuccess={handleSuccess}/>
            <DeleteObraDialog obraId={obra.id} />
         </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-3">
                        <Briefcase className="h-6 w-6 text-primary" />
                        {/* If clientName is the same as address, it's new data, otherwise show old clientName */}
                        {obra.clientName === obra.address ? "Obra" : `Cliente: ${obra.clientName}`}
                    </CardTitle>
                    <CardDescription>{obra.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 grid md:grid-cols-2 gap-4">
                     <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                        <Badge variant="secondary">{obra.stage}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Unidade: {lojaName}</span>
                    </div>
                    {seller && (
                        <div className="flex items-center gap-3 md:col-span-2">
                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">Vendedor: {seller.name}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {obra.details && (
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2">
                          <AlignLeft className="h-5 w-5 text-primary" />
                          Detalhes
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{obra.details}</p>
                  </CardContent>
              </Card>
            )}

            {obra.contacts && obra.contacts.length > 0 ? (
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2">
                          <PhoneCall className="h-5 w-5 text-primary" />
                          Contatos
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      {obra.contacts.map((contact, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/50">
                              <div className="col-span-1 flex flex-col">
                                <span className="text-xs text-muted-foreground">Nome</span>
                                <span className="text-sm font-semibold">{contact.name}</span>
                              </div>
                               <div className="col-span-1 flex flex-col">
                                <span className="text-xs text-muted-foreground">Função</span>
                                <span className="text-sm">{contact.type}</span>
                              </div>
                               <div className="col-span-1 flex flex-col">
                                <span className="text-xs text-muted-foreground">Telefone</span>
                                <span className="text-sm">{contact.phone}</span>
                              </div>
                          </div>
                      ))}
                  </CardContent>
              </Card>
            ) : isOldDataFormat && obra.contactPhone ? (
               <Card>
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2">
                          <PhoneCall className="h-5 w-5 text-primary" />
                          Contato Principal
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm">{obra.contactPhone}</p>
                  </CardContent>
              </Card>
            ) : null }
            
            {obra.photoUrls && obra.photoUrls.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Camera className="h-5 w-5 text-primary" />
                            Fotos da Obra
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Carousel className="w-full max-w-xl mx-auto">
                            <CarouselContent>
                                {obra.photoUrls.map((url, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <Card>
                                                <CardContent className="flex aspect-video items-center justify-center p-0">
                                                    <Image
                                                        src={url}
                                                        alt={`Foto da obra ${index + 1}`}
                                                        width={600}
                                                        height={400}
                                                        className="rounded-md object-cover"
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </CardContent>
                </Card>
            )}

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Status Atual</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant="default" className="text-base px-4 py-2">{obra.status}</Badge>
                </CardContent>
            </Card>
         </div>
         
         <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Localização
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full">
                       <InteractiveMap coordinates={coordinates} />
                    </div>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
