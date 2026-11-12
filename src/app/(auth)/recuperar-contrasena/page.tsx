import type { Metadata } from "next"
import { FormularioRecuperarContrasena } from "@/modules/negocio/componentes/formulario-recuperar-contrasena"
import { TarjetaAcceso } from "@/modules/negocio/componentes/tarjeta-acceso"

export const metadata: Metadata = { title: "Recuperar contraseña" }

export default function PaginaRecuperarContrasena() {
  return (
    <TarjetaAcceso
      titulo="Recuperar contraseña"
      descripcion="Te enviaremos un enlace para crear una nueva contraseña."
    >
      <FormularioRecuperarContrasena />
    </TarjetaAcceso>
  )
}
