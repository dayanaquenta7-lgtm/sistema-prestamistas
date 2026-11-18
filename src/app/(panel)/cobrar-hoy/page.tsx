import { CalendarCheck, UserPlus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { EncabezadoPagina } from "@/shared/componentes/encabezado-pagina"
import { PaginaProtegida } from "@/shared/componentes/pagina-protegida"
import { buttonVariants } from "@/shared/ui/button"

export const metadata: Metadata = { title: "Cobrar hoy" }

// Los cobros del día llegan con los préstamos (Sprints 3 y 4); mientras tanto, estado vacío.
export default function PaginaCobrarHoy() {
  return (
    <PaginaProtegida rol="ayudante">
      <div className="flex flex-col gap-6">
        <EncabezadoPagina titulo="Cobrar hoy" />
        <section className="flex flex-col items-center gap-3 rounded-md border border-dashed px-4 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted" aria-hidden="true">
            <CalendarCheck className="size-6 text-muted-foreground" />
          </span>
          <h2 className="text-lg font-semibold">No hay cobros para hoy</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cuando tengas préstamos con cuotas que vencen hoy o están atrasadas, aparecerán aquí. Empieza registrando a
            tus clientes.
          </p>
          <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href="/clientes/nuevo" className={buttonVariants()}>
              <UserPlus aria-hidden="true" />
              Registrar cliente
            </Link>
            <Link href="/clientes" className={buttonVariants({ variant: "outline" })}>
              Ver clientes
            </Link>
          </div>
        </section>
      </div>
    </PaginaProtegida>
  )
}
