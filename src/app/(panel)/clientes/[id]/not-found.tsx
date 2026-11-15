import Link from "next/link"
import { EstadoVacio } from "@/shared/componentes/estado-vista"
import { buttonVariants } from "@/shared/ui/button"

export default function ClienteNoEncontrado() {
  return (
    <EstadoVacio
      titulo="No encontramos este cliente"
      descripcion="Puede que el enlace sea incorrecto. Búscalo en la lista de clientes."
      accion={
        <Link href="/clientes" className={buttonVariants({ variant: "outline" })}>
          Ir a clientes
        </Link>
      }
    />
  )
}
