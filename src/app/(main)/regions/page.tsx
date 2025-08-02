import { getLojas } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regiões | JCR Radar',
};

export default async function RegionsPage() {
  const lojas = await getLojas();

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
              <ul className="space-y-1">
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
