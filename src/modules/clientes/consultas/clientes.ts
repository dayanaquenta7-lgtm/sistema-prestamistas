import "server-only"
import { and, asc, eq, ilike, or } from "drizzle-orm"
import { db } from "@/shared/db/cliente"
import { clientes } from "@/shared/db/schema"
import { Decimal } from "@/shared/lib/dinero"
import { patronContiene } from "@/shared/lib/busqueda"
import { derivarEstadoCliente, type EstadoCliente, type EstadoPrestamo } from "../dominio/estado-cliente"

/** Límite del listado; con más resultados se pide afinar la búsqueda. */
export const LIMITE_LISTADO = 200

export interface ClienteListado {
  id: string
  nombreCompleto: string
  ci: string | null
  telefono: string | null
  noPrestar: boolean
  estado: EstadoCliente
}

export interface ListadoClientes {
  clientes: ClienteListado[]
  hayMas: boolean
}

/** Préstamos del cliente para derivar su estado. Los préstamos llegan en el Sprint 3. */
function estadosPrestamos(): EstadoPrestamo[] {
  return []
}

/** Siempre filtrado por el negocio de la sesión (obtenerContexto), nunca por uno del cliente. */
export async function listarClientes(negocioId: string, busqueda: string): Promise<ListadoClientes> {
  const filtroNegocio = eq(clientes.negocioId, negocioId)
  const patron = busqueda ? patronContiene(busqueda) : null
  const filas = await db()
    .select({
      id: clientes.id,
      nombreCompleto: clientes.nombreCompleto,
      ci: clientes.ci,
      telefono: clientes.telefono,
      noPrestar: clientes.noPrestar,
    })
    .from(clientes)
    .where(
      patron
        ? and(
            filtroNegocio,
            or(ilike(clientes.nombreCompleto, patron), ilike(clientes.ci, patron), ilike(clientes.telefono, patron)),
          )
        : filtroNegocio,
    )
    .orderBy(asc(clientes.nombreCompleto), asc(clientes.id))
    .limit(LIMITE_LISTADO + 1)

  return {
    clientes: filas.slice(0, LIMITE_LISTADO).map((fila) => ({ ...fila, estado: derivarEstadoCliente(estadosPrestamos()) })),
    hayMas: filas.length > LIMITE_LISTADO,
  }
}

export type Cliente = typeof clientes.$inferSelect

export interface FichaCliente {
  cliente: Cliente
  estado: EstadoCliente
  totalAdeudado: Decimal
}

export async function obtenerCliente(negocioId: string, clienteId: string): Promise<Cliente | null> {
  const [fila] = await db()
    .select()
    .from(clientes)
    .where(and(eq(clientes.id, clienteId), eq(clientes.negocioId, negocioId)))
    .limit(1)
  return fila ?? null
}

/** Ficha completa. El total adeudado y el estado se calculan con los préstamos (Sprint 3). */
export async function obtenerFichaCliente(negocioId: string, clienteId: string): Promise<FichaCliente | null> {
  const cliente = await obtenerCliente(negocioId, clienteId)
  if (!cliente) return null
  return {
    cliente,
    estado: derivarEstadoCliente(estadosPrestamos()),
    totalAdeudado: new Decimal(0),
  }
}
