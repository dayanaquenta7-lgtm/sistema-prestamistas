import type { Metadata } from "next"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"
import { SeccionPendiente } from "@/shared/componentes/seccion-pendiente"

export const metadata: Metadata = { title: "Caja" }


export default function PaginaCaja() {
  return (
    <PaginaProtegida rol="ayudante">
      <SeccionPendiente titulo="Caja" />
    </PaginaProtegida>
  )
}
