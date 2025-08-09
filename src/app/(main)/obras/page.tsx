
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ObrasClientPage from './obras-client-page';

function ObrasPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}

export default function ObrasPage() {
  return (
    <Suspense fallback={<ObrasPageSkeleton />}>
      <ObrasClientPage />
    </Suspense>
  );
}
