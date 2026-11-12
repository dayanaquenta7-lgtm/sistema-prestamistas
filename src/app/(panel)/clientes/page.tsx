import type { Metadata } from "next"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"
import { SeccionPendiente } from "@/shared/componentes/seccion-pendiente"

export const metadata: Metadata = { title: "Clientes" }


export default function PaginaClientes() {
  return (
    <PaginaProtegida rol="ayudante">
      <SeccionPendiente titulo="Clientes" />
    </PaginaProtegida>
  )
}
