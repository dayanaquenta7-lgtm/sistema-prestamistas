import type { Metadata } from "next"
import { VistaNuevoCliente } from "@/modules/clientes/componentes/vista-formulario-cliente"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"

export const metadata: Metadata = { title: "Registrar cliente" }

export default function PaginaNuevoCliente() {
  return (
    <PaginaProtegida rol="ayudante">
      <VistaNuevoCliente />
    </PaginaProtegida>
  )
}
