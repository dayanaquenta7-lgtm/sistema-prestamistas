import type { Metadata } from "next"
import { FormularioRegistro } from "@/modules/negocio/componentes/formulario-registro"
import { TarjetaAcceso } from "@/modules/negocio/componentes/tarjeta-acceso"

export const metadata: Metadata = { title: "Crear cuenta" }

export default function PaginaRegistro() {
  return (
    <TarjetaAcceso titulo="Crear cuenta" descripcion="Registra tu negocio y empieza a llevar tus préstamos.">
      <FormularioRegistro />
    </TarjetaAcceso>
  )
}
