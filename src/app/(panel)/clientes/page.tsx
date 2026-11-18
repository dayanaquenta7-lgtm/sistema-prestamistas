import type { Metadata } from "next"
import { Suspense } from "react"
import { BotonRegistrarCliente, VistaListadoClientes } from "@/modules/clientes/componentes/vista-listado-clientes"
import { EncabezadoPagina } from "@/shared/componentes/encabezado-pagina"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"
import { EsqueletoTabla } from "@/shared/componentes/tabla-datos"

export const metadata: Metadata = { title: "Clientes" }

// searchParams se lee dentro de Suspense: es dato de la URL y no puede ir en el App Shell.
async function Listado({ searchParams }: Pick<PageProps<"/clientes">, "searchParams">) {
  const { q } = await searchParams
  return <VistaListadoClientes q={q} />
}

export default function PaginaClientes({ searchParams }: PageProps<"/clientes">) {
  return (
    <PaginaProtegida rol="ayudante">
      <div className="flex flex-col gap-6">
        <EncabezadoPagina
          titulo="Clientes"
          descripcion="Busca por nombre, CI o teléfono."
          acciones={<BotonRegistrarCliente />}
        />
        <Suspense fallback={<EsqueletoTabla />}>
          <Listado searchParams={searchParams} />
        </Suspense>
      </div>
    </PaginaProtegida>
  )
}
