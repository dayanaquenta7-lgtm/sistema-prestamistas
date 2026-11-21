import { ChevronRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

export interface Miga {
  titulo: string
  href?: string
}

interface EncabezadoPaginaProps {
  titulo: string
  descripcion?: string
  migas?: Miga[]
  /** Acciones principales, alineadas a la derecha en escritorio. */
  acciones?: ReactNode
}

export function EncabezadoPagina({ titulo, descripcion, migas, acciones }: EncabezadoPaginaProps) {
  return (
    <header className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        {migas && migas.length > 0 ? (
          <nav aria-label="Ruta de navegación">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              {migas.map((miga, indice) => (
                <li key={`${miga.titulo}-${indice}`} className="flex items-center gap-1">
                  {indice > 0 ? <ChevronRight className="size-4" aria-hidden="true" /> : null}
                  {miga.href ? (
                    <Link href={miga.href} className="hover:text-foreground hover:underline">
                      {miga.titulo}
                    </Link>
                  ) : (
                    <span>{miga.titulo}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="text-xl font-semibold">{titulo}</h1>
        {descripcion ? <p className="text-sm text-muted-foreground">{descripcion}</p> : null}
      </div>
      {acciones ? <div className="flex flex-wrap gap-2">{acciones}</div> : null}
    </header>
  )
}
