import type { Metadata } from "next"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"
import { SeccionPendiente } from "@/shared/componentes/seccion-pendiente"

export const metadata: Metadata = { title: "Préstamos" }


export default function PaginaPrestamos() {
  return (
    <PaginaProtegida rol="ayudante">
      <SeccionPendiente titulo="Préstamos" />
    </PaginaProtegida>
  )
}
