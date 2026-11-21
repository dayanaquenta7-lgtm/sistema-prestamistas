import type { Metadata } from "next"
import { Suspense } from "react"
import { EsqueletoAcceso } from "@/modules/negocio/componentes/esqueleto-acceso"
import { VistaInvitacion } from "@/modules/negocio/componentes/vista-invitacion"

export const metadata: Metadata = { title: "Invitación" }

async function Contenido({ params }: PageProps<"/invitacion/[codigo]">) {
  const { codigo } = await params
  return <VistaInvitacion codigo={codigo} />
}

// Pública (RUTAS_PUBLICAS): con o sin sesión. El acceso real se valida al aceptar.
export default function PaginaInvitacion(props: PageProps<"/invitacion/[codigo]">) {
  return (
    <Suspense fallback={<EsqueletoAcceso />}>
      <Contenido {...props} />
    </Suspense>
  )
}
