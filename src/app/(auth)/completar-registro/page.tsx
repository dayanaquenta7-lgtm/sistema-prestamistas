import type { Metadata } from "next"
import { Suspense } from "react"
import { EsqueletoAcceso } from "@/modules/negocio/componentes/esqueleto-acceso"
import { VistaCompletarRegistro } from "@/modules/negocio/componentes/vista-completar-registro"

export const metadata: Metadata = { title: "Completar registro" }

export default function PaginaCompletarRegistro() {
  return (
    <Suspense fallback={<EsqueletoAcceso />}>
      <VistaCompletarRegistro />
    </Suspense>
  )
}
