import type { Metadata } from "next"
import { VistaPlantillas } from "@/modules/configuracion/componentes/vistas"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Plantillas de préstamo" }

export default function PaginaPlantillas() {
  return (
    <PaginaProtegida rol="dueno">
      <VistaPlantillas />
    </PaginaProtegida>
  )
}
