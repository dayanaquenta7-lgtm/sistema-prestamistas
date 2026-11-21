import type { Metadata } from "next"
import { VistaNuevaPlantilla } from "@/modules/configuracion/componentes/vistas"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Nueva plantilla" }

export default function PaginaNuevaPlantilla() {
  return (
    <PaginaProtegida rol="dueno">
      <VistaNuevaPlantilla />
    </PaginaProtegida>
  )
}
