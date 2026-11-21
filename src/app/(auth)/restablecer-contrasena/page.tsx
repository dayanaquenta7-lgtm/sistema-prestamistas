import type { Metadata } from "next"
import { Suspense } from "react"
import { obtenerUsuario } from "@/shared/auth/sesion"
import { EsqueletoAcceso } from "@/modules/negocio/componentes/esqueleto-acceso"
import { FormularioRestablecerContrasena } from "@/modules/negocio/componentes/formulario-restablecer-contrasena"
import { TarjetaAcceso } from "@/modules/negocio/componentes/tarjeta-acceso"

export const metadata: Metadata = { title: "Nueva contraseña" }

async function ContenidoRestablecer() {
  // Exige la sesión que crea /auth/confirm con el enlace de recuperación; no exige negocio.
  const usuario = await obtenerUsuario()
  return (
    <TarjetaAcceso titulo="Nueva contraseña" descripcion={`Cuenta: ${usuario.correo}`}>
      <FormularioRestablecerContrasena />
    </TarjetaAcceso>
  )
}

export default function PaginaRestablecerContrasena() {
  return (
    <Suspense fallback={<EsqueletoAcceso />}>
      <ContenidoRestablecer />
    </Suspense>
  )
}
