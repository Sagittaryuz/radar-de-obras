
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { getObraById, getUserById, getLojas } from '@/lib/mock-data';
import type { Obra, User, Loja } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, MapPin, Phone, Building, Wrench, Home, Hash, Briefcase, Edit, Trash2, Camera, PhoneCall, AlignLeft, Calendar, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EditObraDialog } from '@/components/obras/edit-obra-dialog';
import { DeleteObraDialog } from '@/components/obras/delete-obra-dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { InteractiveMap } from '@/components/obras/interactive-map';
import { getCoordinatesForAddress } from '@/lib/actions';
import { ObraComments } from '@/components/obras/obra-comments';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RegisterSaleDialog } from '@/components/obras/register-sale-dialog';

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

function formatTimestamp(date: any): string {
    if (!date) return '';
    let d: Date;
    // Check if it's a Firestore Timestamp
    if (date.seconds !== undefined && date.nanoseconds !== undefined) {
        d = new Timestamp(date.seconds, date.nanoseconds).toDate();
    } else if (typeof date === 'string' || date instanceof Date) {
        d = new Date(date);
    } else {
        // Not a recognizable date format
        return '';
    }
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function formatCurrency(value: number | undefined | null) {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
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
  const cardTitle = (obra.contacts && obra.contacts.length > 0 && obra.contacts[0].name) ? obra.contacts[0].name : obra.clientName;
  const creationDate = formatTimestamp(obra.createdAt);
  const saleDate = formatTimestamp(obra.closedAt);
  const isSold = obra.status === 'Ganha' && obra.closedValue;


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
                        {cardTitle}
                    </CardTitle>
                    {creationDate && (
                       <div className="flex items-center text-sm text-muted-foreground gap-2">
                           <Calendar className="h-4 w-4" />
                           <span>Coleta em: {creationDate}</span>
                       </div>
                    )}
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

            <ObraComments obraId={obra.id} />

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

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Status Atual</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant="default" className="text-base px-4 py-2">{obra.status}</Badge>
                </CardContent>
            </Card>

            {isSold ? (
                <Card className="bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-800 flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-green-800 dark:text-green-300">
                            <DollarSign className="h-5 w-5"/>
                            Venda Registrada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 flex-grow">
                         <div>
                            <p className="text-xs text-green-700 dark:text-green-400">Nº do Pedido</p>
                            <p className="font-semibold">{obra.orderNumber || 'Não informado'}</p>
                         </div>
                         <div>
                            <p className="text-xs text-green-700 dark:text-green-400">Valor da Venda</p>
                            <p className="font-bold text-lg">{formatCurrency(obra.closedValue)}</p>
                         </div>
                         <RegisterSaleDialog obra={obra} onSuccess={handleSuccess}>
                             <Button variant="outline" size="sm" className="w-full mt-2">
                                <Edit className="mr-2 h-4 w-4"/>
                                Editar Venda
                            </Button>
                         </RegisterSaleDialog>
                    </CardContent>
                    {saleDate && (
                        <CardFooter className="pt-4 pb-2 px-6">
                            <div className="flex items-center text-xs text-green-700 dark:text-green-400 gap-2">
                                <Clock className="h-3 w-3" />
                                <span>Registrada em: {saleDate}</span>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            ) : (
                <RegisterSaleDialog obra={obra} onSuccess={handleSuccess}>
                    <Button className="w-full bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700">
                        <DollarSign className="mr-2 h-4 w-4"/>
                        Registrar Venda
                    </Button>
                </RegisterSaleDialog>
            )}

         </div>
      </div>
    </div>
  );
}
