import type { Metadata } from "next"
import { Suspense } from "react"
import { EsqueletoAcceso } from "@/modules/negocio/componentes/esqueleto-acceso"
import { FormularioRegistro } from "@/modules/negocio/componentes/formulario-registro"
import { FormularioRegistroInvitado } from "@/modules/negocio/componentes/formulario-registro-invitado"
import { TarjetaAcceso } from "@/modules/negocio/componentes/tarjeta-acceso"
import { esCodigoInvitacion } from "@/shared/auth/rutas"

export const metadata: Metadata = { title: "Crear cuenta" }

async function ContenidoRegistro({ searchParams }: PageProps<"/registro">) {
  const { invitacion } = await searchParams
  // Desde un enlace de invitación la cuenta no crea negocio: se une a uno existente como ayudante.
  if (esCodigoInvitacion(invitacion)) {
    return (
      <TarjetaAcceso titulo="Crear cuenta" descripcion="Crea tu cuenta para unirte al negocio que te invitó.">
        <FormularioRegistroInvitado codigo={invitacion} />
      </TarjetaAcceso>
    )
  }
  return (
    <TarjetaAcceso titulo="Crear cuenta" descripcion="Registra tu negocio y empieza a llevar tus préstamos.">
      <FormularioRegistro />
    </TarjetaAcceso>
  )
}

export default function PaginaRegistro(props: PageProps<"/registro">) {
  return (
    <Suspense fallback={<EsqueletoAcceso />}>
      <ContenidoRegistro {...props} />
    </Suspense>
  )
}
