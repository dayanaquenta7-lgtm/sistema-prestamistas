import type { Metadata } from "next"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"
import { SeccionPendiente } from "@/shared/componentes/seccion-pendiente"

export const metadata: Metadata = { title: "Inicio" }

// Solo el dueño (docs/alcance.md, sección 1).

export default function PaginaInicio() {
  return (
    <PaginaProtegida rol="dueno">
      <SeccionPendiente titulo="Inicio" />
    </PaginaProtegida>
  )
}
