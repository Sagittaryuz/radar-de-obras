
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getObraById, getUserById, getLojas, getObras, getUsers } from '@/lib/firestore-data';
import type { Obra, User, Loja, Sale } from '@/lib/firestore-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, MapPin, Phone, Building, Wrench, Home, Hash, Briefcase, Edit, Trash2, Camera, PhoneCall, AlignLeft, Calendar, DollarSign, Clock, Archive, ShoppingCart, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditObraDialog } from '@/components/obras/edit-obra-dialog';
import { DeleteObraDialog } from '@/components/obras/delete-obra-dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { InteractiveMap } from '@/components/obras/interactive-map';
import { ObraComments } from '@/components/obras/obra-comments';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RegisterSaleDialog } from '@/components/obras/register-sale-dialog';
import { useAuth } from '@/context/auth-context';
import { AssignSellerDialog } from '@/components/obras/assign-seller-dialog';
import { ArchiveObraDialog } from '@/components/obras/archive-obra-dialog';
import { Separator } from '@/components/ui/separator';

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
    if (date instanceof Timestamp) {
        d = date.toDate();
    } else if (typeof date === 'string' || date instanceof Date) {
        d = new Date(date);
    } else {
        return '';
    }
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function formatSaleDate(date: any): string {
    if (!date) return '';
    let d: Date;
    if (date instanceof Timestamp) {
        d = date.toDate();
    } else if (typeof date === 'string' || date instanceof Date) {
        d = new Date(date);
    } else {
        return '';
    }
    return format(d, "dd/MM/yyyy", { locale: ptBR });
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

  const { user: currentUser } = useAuth();
  const [obra, setObra] = useState<Obra | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [vendedores, setVendedores] = useState<User[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSuccess = () => {
    fetchData();
  };

  const fetchData = async () => {
    if (!obraId) return;
    setLoading(true);
    try {
      console.log(`[getObraById] Fetching obra with ID: ${obraId}`);
      const [obraData, lojasData, todosUsuarios, todasObras] = await Promise.all([
          getObraById(obraId),
          getLojas(),
          getUsers(),
          getObras()
      ]);
      
      if (obraData) {
        setObra(obraData);
        setLojas(lojasData);
        setObras(todasObras);

        const vendedoresDaLoja = todosUsuarios.filter(u => u.role === 'Vendedor' && u.lojaId === obraData.lojaId);
        setVendedores(vendedoresDaLoja);
        
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
  }, [obraId]);

  if (loading) {
    return <ObraDetailSkeleton />;
  }

  if (!obra) {
    return <div>Obra não encontrada.</div>;
  }
  
  const lojaName = lojas.find(l => l.id === obra.lojaId)?.name || obra.lojaId;
  const isOldDataFormat = !obra.contacts || obra.contacts.length === 0;
  const cardTitle = (obra.contacts && obra.contacts.length > 0 && obra.contacts[0].name) ? obra.contacts[0].name : obra.clientName;
  const creationDate = formatTimestamp(obra.createdAt);
  
  const totalSalesValue = obra.sales ? obra.sales.reduce((sum, sale) => sum + sale.value, 0) : 0;
  const hasSales = obra.sales && obra.sales.length > 0;

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Gerente';


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="font-headline text-3xl font-bold tracking-tight">
            Detalhes da Obra
         </h1>
         <div className="flex items-center gap-2">
            {canEdit && <EditObraDialog obra={obra} onSuccess={handleSuccess}/>}
            {canEdit && <DeleteObraDialog obraId={obra.id} />}
            <ArchiveObraDialog obraId={obra.id} onSuccess={() => router.push('/obras')} />
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
            
            {currentUser?.role === 'Gerente' && obra.status === 'Triagem' && (
                <AssignSellerDialog 
                    obra={obra} 
                    vendedores={vendedores} 
                    obras={obras}
                    onSuccess={handleSuccess} 
                />
            )}

            <Card className="bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-800 flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline flex items-center gap-2 text-green-800 dark:text-green-300">
                                <ShoppingCart className="h-5 w-5"/>
                                Vendas da Obra
                            </CardTitle>
                            <CardDescription className="text-green-700 dark:text-green-400">
                                Total de {formatCurrency(totalSalesValue)}
                            </CardDescription>
                        </div>
                        <RegisterSaleDialog obra={obra} onSuccess={handleSuccess}>
                             <Button variant="outline" size="sm">
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Gerenciar
                            </Button>
                        </RegisterSaleDialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                    {hasSales ? (
                        obra.sales?.map((sale, index) => (
                            <div key={sale.id}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-green-900 dark:text-green-200">{formatCurrency(sale.value)}</p>
                                        <p className="text-xs text-green-700 dark:text-green-400">Pedido: {sale.orderNumber || 'N/A'}</p>
                                    </div>
                                    <p className="text-xs text-green-700 dark:text-green-400">{formatSaleDate(sale.date)}</p>
                                </div>
                                {index < obra.sales!.length - 1 && <Separator className="my-2 bg-green-200 dark:bg-green-800" />}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-green-800 dark:text-green-300">Nenhuma venda registrada.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

         </div>
      </div>
    </div>
  );
}
