import type { Metadata } from "next"
import { VistaNegocio } from "@/modules/configuracion/componentes/vistas"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Negocio y tope legal" }

export default function PaginaNegocio() {
  return (
    <PaginaProtegida rol="dueno">
      <VistaNegocio />
    </PaginaProtegida>
  )
}
