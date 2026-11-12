import { Suspense, type ReactNode } from "react"
import type { Rol } from "@/shared/auth/permisos"
import { requerirRol } from "@/shared/auth/sesion"
import { Skeleton } from "@/shared/ui/skeleton"

interface PaginaProtegidaProps {
  /** Rol mínimo: "ayudante" admite a ambos roles; "dueno", solo al dueño. */
  rol: Rol
  children: ReactNode
}

/**
 * Verifica sesión, negocio y rol en el servidor antes de renderizar el
 * contenido. Ocultar una sección del menú no basta: cada página restringida
 * debe pasar por aquí. Las consultas de datos deben seguir usando
 * obtenerContexto() para filtrar por el negocio de la sesión.
 */
export function PaginaProtegida({ rol, children }: PaginaProtegidaProps) {
  return (
    <Suspense fallback={<EsqueletoPagina />}>
      <Verificacion rol={rol}>{children}</Verificacion>
    </Suspense>
  )
}

async function Verificacion({ rol, children }: PaginaProtegidaProps) {
  await requerirRol(rol)
  return <>{children}</>
}

export function EsqueletoPagina() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando">
      <div className="flex flex-col gap-2 border-b pb-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
