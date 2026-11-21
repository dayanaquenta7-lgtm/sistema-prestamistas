import type { Metadata } from "next"
import { VistaIndiceConfiguracion } from "@/modules/configuracion/componentes/vistas"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Configuración" }

// Solo el dueño (docs/alcance.md, sección 1).
export default function PaginaConfiguracion() {
  return (
    <PaginaProtegida rol="dueno">
      <VistaIndiceConfiguracion />
    </PaginaProtegida>
  )
}
