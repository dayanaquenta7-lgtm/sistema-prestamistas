import type { Metadata } from "next"
import { Suspense } from "react"
import { VistaEditarPlantilla } from "@/modules/configuracion/componentes/vistas"
import { EsqueletoPagina, PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Editar plantilla" }

async function Edicion({ params }: Pick<PageProps<"/configuracion/plantillas/[id]/editar">, "params">) {
  const { id } = await params
  return <VistaEditarPlantilla id={id} />
}

export default function PaginaEditarPlantilla({ params }: PageProps<"/configuracion/plantillas/[id]/editar">) {
  return (
    <PaginaProtegida rol="dueno">
      <Suspense fallback={<EsqueletoPagina />}>
        <Edicion params={params} />
      </Suspense>
    </PaginaProtegida>
  )
}
