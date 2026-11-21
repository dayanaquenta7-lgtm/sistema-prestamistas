import type { Metadata } from "next"
import { FormularioReenviarConfirmacion } from "@/modules/negocio/componentes/formulario-reenviar-confirmacion"
import { TarjetaAcceso } from "@/modules/negocio/componentes/tarjeta-acceso"

export const metadata: Metadata = { title: "Reenviar confirmación" }

export default function PaginaReenviarConfirmacion() {
  return (
    <TarjetaAcceso
      titulo="Reenviar confirmación"
      descripcion="Te enviaremos un nuevo enlace para confirmar tu correo y terminar de crear tu negocio."
    >
      <FormularioReenviarConfirmacion />
    </TarjetaAcceso>
  )
}
