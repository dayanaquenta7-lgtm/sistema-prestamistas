import type { Metadata } from "next"
import { Suspense } from "react"
import { VistaFeriados } from "@/modules/configuracion/componentes/vistas"
import { EsqueletoPagina, PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Feriados" }

// searchParams se lee dentro de Suspense: es dato de la URL y no puede ir en el App Shell.
async function Lista({ searchParams }: Pick<PageProps<"/configuracion/feriados">, "searchParams">) {
  const { anio } = await searchParams
  return <VistaFeriados anio={anio} />
}

export default function PaginaFeriados({ searchParams }: PageProps<"/configuracion/feriados">) {
  return (
    <PaginaProtegida rol="dueno">
      <Suspense fallback={<EsqueletoPagina />}>
        <Lista searchParams={searchParams} />
      </Suspense>
    </PaginaProtegida>
  )
}
