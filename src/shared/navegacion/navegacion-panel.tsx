"use client"

import {
  Banknote,
  Calculator,
  Ellipsis,
  HandCoins,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet"
import { esSeccionActiva, type IdSeccion, type Seccion } from "./secciones"

const ICONOS: Record<IdSeccion, LucideIcon> = {
  "cobrar-hoy": HandCoins,
  inicio: LayoutDashboard,
  clientes: Users,
  prestamos: Banknote,
  simulador: Calculator,
  caja: Wallet,
  configuracion: Settings,
  auditoria: ScrollText,
}

interface NavegacionPanelProps {
  secciones: Seccion[]
  nombreNegocio: string
  nombreUsuario: string
  /** Selector de negocio si el usuario tiene más de uno (lo provee el módulo de negocio). */
  selectorNegocio?: ReactNode
  /** Botón de cerrar sesión (lo provee el módulo de negocio). */
  pie: ReactNode
}

export function NavegacionPanel({
  secciones,
  nombreNegocio,
  nombreUsuario,
  selectorNegocio,
  pie,
}: NavegacionPanelProps) {
  const rutaActual = usePathname()
  const [masAbierto, setMasAbierto] = useState(false)
  const principales = secciones.filter((seccion) => seccion.principalMovil)
  const secundarias = secciones.filter((seccion) => !seccion.principalMovil)
  const masActivo = secundarias.some((seccion) => esSeccionActiva(seccion, rutaActual))

  return (
    <>
      {/* Escritorio: barra lateral fija */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
        {selectorNegocio ? (
          <div className="border-b p-2">{selectorNegocio}</div>
        ) : (
          <div className="border-b px-4 py-4">
            <p className="truncate font-semibold">{nombreNegocio}</p>
            <p className="truncate text-sm text-muted-foreground">{nombreUsuario}</p>
          </div>
        )}
        <nav aria-label="Secciones" className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-0.5">
            {secciones.map((seccion) => (
              <li key={seccion.id}>
                <EnlaceSeccion seccion={seccion} activa={esSeccionActiva(seccion, rutaActual)} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-2">{pie}</div>
      </aside>

      {/* Celular: barra inferior + "Más" */}
      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {principales.map((seccion) => (
            <li key={seccion.id}>
              <EnlaceInferior seccion={seccion} activa={esSeccionActiva(seccion, rutaActual)} />
            </li>
          ))}
          <li>
            <Sheet open={masAbierto} onOpenChange={setMasAbierto}>
              <SheetTrigger
                className={cn(
                  "flex h-16 w-full flex-col items-center justify-center gap-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  masActivo ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Ellipsis className="size-4" aria-hidden="true" />
                Más
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-md">
                <SheetHeader>
                  <SheetTitle className={selectorNegocio ? "sr-only" : undefined}>{nombreNegocio}</SheetTitle>
                  {selectorNegocio ?? <p className="text-sm text-muted-foreground">{nombreUsuario}</p>}
                </SheetHeader>
                <ul className="flex flex-col gap-0.5 px-2">
                  {secundarias.map((seccion) => (
                    <li key={seccion.id}>
                      <EnlaceSeccion
                        seccion={seccion}
                        activa={esSeccionActiva(seccion, rutaActual)}
                        alNavegar={() => setMasAbierto(false)}
                      />
                    </li>
                  ))}
                </ul>
                <div className="border-t p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">{pie}</div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </>
  )
}

function EnlaceSeccion({
  seccion,
  activa,
  alNavegar,
}: {
  seccion: Seccion
  activa: boolean
  alNavegar?: () => void
}) {
  const Icono = ICONOS[seccion.id]
  return (
    <Link
      href={seccion.ruta}
      onClick={alNavegar}
      aria-current={activa ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:h-9",
        activa
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-foreground hover:bg-muted",
      )}
    >
      <Icono className="size-4 shrink-0" aria-hidden="true" />
      {seccion.titulo}
    </Link>
  )
}

function EnlaceInferior({ seccion, activa }: { seccion: Seccion; activa: boolean }) {
  const Icono = ICONOS[seccion.id]
  return (
    <Link
      href={seccion.ruta}
      aria-current={activa ? "page" : undefined}
      className={cn(
        "flex h-16 flex-col items-center justify-center gap-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        activa ? "font-medium text-primary" : "text-muted-foreground",
      )}
    >
      <Icono className="size-4" aria-hidden="true" />
      <span className="max-w-full truncate px-1">{seccion.titulo}</span>
    </Link>
  )
}
