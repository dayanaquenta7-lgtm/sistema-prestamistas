import type { Metadata } from "next"
import { Suspense } from "react"
import { VistaEditarCliente } from "@/modules/clientes/componentes/vista-formulario-cliente"
import { EsqueletoPagina, PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Editar cliente" }

async function Edicion({ params }: Pick<PageProps<"/clientes/[id]/editar">, "params">) {
  const { id } = await params
  return <VistaEditarCliente id={id} />
}

export default function PaginaEditarCliente({ params }: PageProps<"/clientes/[id]/editar">) {
  return (
    <PaginaProtegida rol="ayudante">
      <Suspense fallback={<EsqueletoPagina />}>
        <Edicion params={params} />
      </Suspense>
    </PaginaProtegida>
  )
}
