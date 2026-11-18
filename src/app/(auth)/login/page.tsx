import type { Metadata } from "next"
import { Suspense } from "react"
import { EsqueletoAcceso } from "@/modules/negocio/componentes/esqueleto-acceso"
import { FormularioInicioSesion } from "@/modules/negocio/componentes/formulario-inicio-sesion"
import { TarjetaAcceso } from "@/modules/negocio/componentes/tarjeta-acceso"
import { avisoLogin } from "@/shared/auth/confirmacion"
import { destinoPermitido } from "@/shared/auth/rutas"

export const metadata: Metadata = { title: "Iniciar sesión" }

const PREFIJO_INVITACION = "/invitacion/"

async function ContenidoLogin({ searchParams }: PageProps<"/login">) {
  const { error, siguiente } = await searchParams
  const aviso = avisoLogin(error)
  // Solo se conserva un destino de la lista permitida (por ejemplo, la invitación de la que viene).
  const destino = typeof siguiente === "string" && destinoPermitido(siguiente) === siguiente ? siguiente : undefined
  const codigoInvitacion = destino?.startsWith(PREFIJO_INVITACION) ? destino.slice(PREFIJO_INVITACION.length) : undefined
  return (
    <TarjetaAcceso
      titulo="Iniciar sesión"
      descripcion={codigoInvitacion ? "Inicia sesión para aceptar la invitación." : undefined}
    >
      <FormularioInicioSesion avisoInicial={aviso} siguiente={destino} codigoInvitacion={codigoInvitacion} />
    </TarjetaAcceso>
  )
}

export default function PaginaLogin(props: PageProps<"/login">) {
  return (
    <Suspense fallback={<EsqueletoAcceso />}>
      <ContenidoLogin {...props} />
    </Suspense>
  )
}
