import type { Metadata } from "next"
import { VistaUsuarios } from "@/modules/negocio/componentes/vista-usuarios"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Usuarios" }

export default function PaginaUsuarios() {
  return (
    <PaginaProtegida rol="dueno">
      <VistaUsuarios />
    </PaginaProtegida>
  )
}
