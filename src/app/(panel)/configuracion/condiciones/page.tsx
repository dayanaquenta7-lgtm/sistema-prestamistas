import type { Metadata } from "next"
import { VistaCondicionesDefecto } from "@/modules/configuracion/componentes/vistas"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Condiciones por defecto" }

export default function PaginaCondicionesDefecto() {
  return (
    <PaginaProtegida rol="dueno">
      <VistaCondicionesDefecto />
    </PaginaProtegida>
  )
}
