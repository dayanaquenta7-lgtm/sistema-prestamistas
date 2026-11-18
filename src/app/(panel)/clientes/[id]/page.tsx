import type { Metadata } from "next"
import { Suspense } from "react"
import { VistaFichaCliente } from "@/modules/clientes/componentes/vista-ficha-cliente"
import { EsqueletoPagina, PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Ficha del cliente" }

async function Ficha({ params }: Pick<PageProps<"/clientes/[id]">, "params">) {
  const { id } = await params
  return <VistaFichaCliente id={id} />
}

export default function PaginaFichaCliente({ params }: PageProps<"/clientes/[id]">) {
  return (
    <PaginaProtegida rol="ayudante">
      <Suspense fallback={<EsqueletoPagina />}>
        <Ficha params={params} />
      </Suspense>
    </PaginaProtegida>
  )
}
