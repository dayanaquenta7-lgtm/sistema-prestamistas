import { Pencil } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { obtenerContexto } from "@/shared/auth/sesion"
import { Aviso } from "@/shared/componentes/aviso"
import { BadgeEstado } from "@/shared/componentes/badge-estado"
import { EncabezadoPagina } from "@/shared/componentes/encabezado-pagina"
import { EstadoVacio } from "@/shared/componentes/estado-vista"
import { TarjetaIndicador } from "@/shared/componentes/tarjeta-indicador"
import { formatearMonto } from "@/shared/lib/dinero"
import { formatearFecha } from "@/shared/lib/fechas"
import { buttonVariants } from "@/shared/ui/button"
import { obtenerFichaCliente } from "../consultas/clientes"
import { formatearTasa } from "@/shared/lib/tasas"
import { puedeGestionarCondiciones } from "../dominio/reglas-cliente"
import { esquemaIdCliente } from "../esquemas/cliente"
import { BadgeNoPrestar } from "./badge-no-prestar"
import { ControlNoPrestar } from "./control-no-prestar"

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="wrap-break-word">{children ?? "—"}</dd>
    </div>
  )
}

function Telefono({ numero }: { numero: string | null }) {
  if (!numero) return null
  return (
    <a href={`tel:${numero.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-9 items-center text-primary underline-offset-4 hover:underline">
      {numero}
    </a>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">{titulo}</h2>
      {children}
    </section>
  )
}

export async function VistaFichaCliente({ id }: { id: string }) {
  const idValido = esquemaIdCliente.safeParse(id)
  if (!idValido.success) notFound()

  const { negocio, rol } = await obtenerContexto()
  const ficha = await obtenerFichaCliente(negocio.id, idValido.data)
  if (!ficha) notFound()
  const { cliente, estado, totalAdeudado } = ficha
  const esDueno = puedeGestionarCondiciones(rol)

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo={cliente.nombreCompleto}
        migas={[{ titulo: "Clientes", href: "/clientes" }, { titulo: cliente.nombreCompleto }]}
        acciones={
          <Link href={`/clientes/${cliente.id}/editar`} className={buttonVariants({ variant: "outline" })}>
            <Pencil aria-hidden="true" />
            Editar
          </Link>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <BadgeEstado estado={estado} />
        {cliente.noPrestar ? <BadgeNoPrestar /> : null}
      </div>

      {cliente.noPrestar ? (
        <Aviso variante="error">
          <p className="font-medium">No prestar a este cliente</p>
          <p className="wrap-break-word">Motivo: {cliente.noPrestarMotivo}</p>
        </Aviso>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <TarjetaIndicador titulo="Total adeudado" valor={formatearMonto(totalAdeudado)} />
      </div>

      <Seccion titulo="Datos">
        <dl className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-2">
          <Dato etiqueta="CI">{cliente.ci}</Dato>
          <Dato etiqueta="Teléfono">{cliente.telefono ? <Telefono numero={cliente.telefono} /> : null}</Dato>
          <Dato etiqueta="Dirección">{cliente.direccion}</Dato>
          <Dato etiqueta="Referencia">
            {cliente.referenciaNombre || cliente.referenciaTelefono ? (
              <span className="flex flex-wrap items-center gap-x-2">
                {cliente.referenciaNombre}
                <Telefono numero={cliente.referenciaTelefono} />
              </span>
            ) : null}
          </Dato>
          <Dato etiqueta="Tasa preferencial">
            {cliente.tasaPreferencial ? `${formatearTasa(cliente.tasaPreferencial)} %` : "Sin tasa preferencial"}
          </Dato>
          <Dato etiqueta="Registrado el">{formatearFecha(cliente.creadoEn, negocio.zonaHoraria)}</Dato>
          <div className="md:col-span-2">
            <Dato etiqueta="Notas">
              {cliente.notas ? <span className="whitespace-pre-line">{cliente.notas}</span> : null}
            </Dato>
          </div>
        </dl>
      </Seccion>

      {esDueno ? (
        <Seccion titulo="Marca de no prestar">
          <ControlNoPrestar clienteId={cliente.id} noPrestar={cliente.noPrestar} />
        </Seccion>
      ) : null}

      <Seccion titulo="Préstamos">
        <EstadoVacio titulo="Aún no tiene préstamos" descripcion="Los préstamos del cliente aparecerán aquí." />
      </Seccion>

      <Seccion titulo="Pagos">
        <EstadoVacio titulo="Aún no tiene pagos" descripcion="Los pagos que registres aparecerán aquí." />
      </Seccion>
    </div>
  )
}
