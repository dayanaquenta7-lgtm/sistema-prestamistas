import type { Metadata } from "next"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"
import { SeccionPendiente } from "@/shared/componentes/seccion-pendiente"

export const metadata: Metadata = { title: "Cobrar hoy" }


export default function PaginaCobrarHoy() {
  return (
    <PaginaProtegida rol="ayudante">
      <SeccionPendiente titulo="Cobrar hoy" />
    </PaginaProtegida>
  )
}
