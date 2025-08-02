import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-md">
        <Building2 className="h-5 w-5" />
      </div>
      <span className="font-headline text-lg font-bold">
        Radar de Obras
      </span>
    </div>
  );
}
