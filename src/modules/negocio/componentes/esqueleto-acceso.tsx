import { Skeleton } from "@/shared/ui/skeleton"

export function EsqueletoAcceso() {
  return (
    <div className="w-full max-w-sm rounded-md border bg-card p-6" aria-busy="true" aria-label="Cargando">
      <Skeleton className="mb-6 h-6 w-2/3" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-11 w-full md:h-9" />
        <Skeleton className="h-11 w-full md:h-9" />
        <Skeleton className="h-11 w-full md:h-9" />
      </div>
    </div>
  )
}
