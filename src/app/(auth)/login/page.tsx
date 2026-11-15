import type { Metadata } from "next"
import { Suspense } from "react"
import { EsqueletoAcceso } from "@/modules/negocio/componentes/esqueleto-acceso"
import { FormularioInicioSesion } from "@/modules/negocio/componentes/formulario-inicio-sesion"
import { TarjetaAcceso } from "@/modules/negocio/componentes/tarjeta-acceso"
import { avisoLogin } from "@/shared/auth/confirmacion"

export const metadata: Metadata = { title: "Iniciar sesión" }

async function ContenidoLogin({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams
  const aviso = avisoLogin(error)
  return (
    <TarjetaAcceso titulo="Iniciar sesión">
      <FormularioInicioSesion avisoInicial={aviso} />
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
