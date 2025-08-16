
'use client';

import { useState, useEffect } from 'react';
import { getLojas } from '@/lib/firestore-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { Loja } from '@/lib/firestore-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegionsPage() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLojas = async () => {
      setLoading(true);
      const lojasData = await getLojas();
      setLojas(lojasData);
      setLoading(false);
    };
    fetchLojas();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Regiões de Atendimento</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lojas.map(loja => (
          <Card key={loja.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {loja.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold mb-2 text-sm">Bairros Atendidos:</p>
              <ul className="space-y-1 list-disc list-inside">
                {loja.neighborhoods.map(bairro => (
                  <li key={bairro} className="text-sm text-muted-foreground">{bairro}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
