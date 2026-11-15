import type { Metadata } from "next"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"
import { SeccionPendiente } from "@/shared/componentes/seccion-pendiente"

export const metadata: Metadata = { title: "Auditoría" }

// Solo el dueño (docs/alcance.md, sección 1).

export default function PaginaAuditoria() {
  return (
    <PaginaProtegida rol="dueno">
      <SeccionPendiente titulo="Auditoría" />
    </PaginaProtegida>
  )
}
