"use server"

import { and, eq } from "drizzle-orm"
import { obtenerContexto } from "@/shared/auth/sesion"
import { registrarAuditoria } from "@/shared/db/auditoria"
import { db } from "@/shared/db/cliente"
import { describirErrorDb, esViolacionUnica } from "@/shared/db/errores"
import { clientes } from "@/shared/db/schema"
import { exito, fallo, type Resultado } from "@/shared/lib/resultado"
import { validar } from "@/shared/lib/validar"
import {
  cambioDeTasaPermitido,
  planificarAuditoriaEdicion,
  puedeGestionarCondiciones,
  type CamposCliente,
} from "../dominio/reglas-cliente"
import { esquemaCliente, esquemaIdCliente, esquemaMarcarNoPrestar } from "../esquemas/cliente"
import { MENSAJES_CLIENTES as M } from "../mensajes"

const RESTRICCION_CI = "clientes_negocio_ci_unico"
const ENTIDAD = "cliente"

/** Resultado de una operación que no debe llegar a la UI como excepción. */
class FalloControlado extends Error {
  constructor(readonly resultado: ReturnType<typeof fallo>) {
    super(resultado.error)
  }
}

function falloTasa() {
  return fallo(M.revisarDatos, { tasaPreferencial: [M.soloDuenoTasa] })
}

function manejarError(error: unknown, contexto: string, mensaje: string) {
  if (error instanceof FalloControlado) return error.resultado
  if (esViolacionUnica(error, RESTRICCION_CI)) return fallo(M.revisarDatos, { ci: [M.ciDuplicado] })
  console.error(`[clientes] Error al ${contexto}: ${describirErrorDb(error)}`)
  return fallo(mensaje)
}

function camposDe(cliente: typeof clientes.$inferSelect): CamposCliente {
  return {
    nombreCompleto: cliente.nombreCompleto,
    ci: cliente.ci,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    referenciaNombre: cliente.referenciaNombre,
    referenciaTelefono: cliente.referenciaTelefono,
    notas: cliente.notas,
    tasaPreferencial: cliente.tasaPreferencial,
  }
}

/** Dueño y ayudante. Solo el dueño puede definir la tasa preferencial. */
export async function crearCliente(entrada: unknown): Promise<Resultado<{ id: string }>> {
  const { negocio, usuario, rol } = await obtenerContexto()
  const validacion = validar(esquemaCliente, entrada)
  if (!validacion.ok) return validacion
  const datos = validacion.datos
  if (!cambioDeTasaPermitido(rol, null, datos.tasaPreferencial)) return falloTasa()

  try {
    const id = await db().transaction(async (tx) => {
      const [cliente] = await tx
        .insert(clientes)
        .values({ ...datos, negocioId: negocio.id, creadoPor: usuario.id })
        .returning({ id: clientes.id })
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "cliente.crear",
        entidad: ENTIDAD,
        entidadId: cliente.id,
        valorNuevo: { ...datos },
      })
      return cliente.id
    })
    return exito({ id })
  } catch (error) {
    return manejarError(error, "crear el cliente", M.errorGuardar)
  }
}

/** Dueño y ayudante. Un ayudante puede editar los datos, pero no cambiar la tasa preferencial. */
export async function editarCliente(clienteId: unknown, entrada: unknown): Promise<Resultado<{ id: string }>> {
  const { negocio, usuario, rol } = await obtenerContexto()
  const id = esquemaIdCliente.safeParse(clienteId)
  if (!id.success) return fallo(M.noEncontrado)
  const validacion = validar(esquemaCliente, entrada)
  if (!validacion.ok) return validacion
  const nuevo: CamposCliente = validacion.datos

  try {
    await db().transaction(async (tx) => {
      const [actual] = await tx
        .select()
        .from(clientes)
        .where(and(eq(clientes.id, id.data), eq(clientes.negocioId, negocio.id)))
        .for("update")
        .limit(1)
      if (!actual) throw new FalloControlado(fallo(M.noEncontrado))

      const anterior = camposDe(actual)
      if (!cambioDeTasaPermitido(rol, anterior.tasaPreferencial, nuevo.tasaPreferencial)) {
        throw new FalloControlado(falloTasa())
      }

      const registros = planificarAuditoriaEdicion(anterior, nuevo)
      if (registros.length === 0) return

      await tx
        .update(clientes)
        .set(nuevo)
        .where(and(eq(clientes.id, actual.id), eq(clientes.negocioId, negocio.id)))
      for (const registro of registros) {
        await registrarAuditoria(tx, {
          negocioId: negocio.id,
          usuarioId: usuario.id,
          accion: registro.accion,
          entidad: ENTIDAD,
          entidadId: actual.id,
          valorAnterior: registro.valorAnterior,
          valorNuevo: registro.valorNuevo,
        })
      }
    })
    return exito({ id: id.data })
  } catch (error) {
    return manejarError(error, "editar el cliente", M.errorGuardar)
  }
}

/** Solo el dueño. El motivo es obligatorio al activar la marca. */
export async function marcarNoPrestar(clienteId: unknown, entrada: unknown): Promise<Resultado> {
  const { negocio, usuario, rol } = await obtenerContexto()
  if (!puedeGestionarCondiciones(rol)) return fallo(M.soloDuenoNoPrestar)
  const id = esquemaIdCliente.safeParse(clienteId)
  if (!id.success) return fallo(M.noEncontrado)
  const validacion = validar(esquemaMarcarNoPrestar, entrada)
  if (!validacion.ok) return validacion
  const { motivo } = validacion.datos

  try {
    await db().transaction(async (tx) => {
      const [actual] = await tx
        .select({ id: clientes.id, noPrestar: clientes.noPrestar })
        .from(clientes)
        .where(and(eq(clientes.id, id.data), eq(clientes.negocioId, negocio.id)))
        .for("update")
        .limit(1)
      if (!actual) throw new FalloControlado(fallo(M.noEncontrado))
      if (actual.noPrestar) throw new FalloControlado(fallo(M.yaNoPrestar))

      await tx
        .update(clientes)
        .set({ noPrestar: true, noPrestarMotivo: motivo })
        .where(and(eq(clientes.id, actual.id), eq(clientes.negocioId, negocio.id)))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "cliente.marcar_no_prestar",
        entidad: ENTIDAD,
        entidadId: actual.id,
        valorAnterior: { noPrestar: false, noPrestarMotivo: null },
        valorNuevo: { noPrestar: true, noPrestarMotivo: motivo },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "marcar no prestar", M.errorNoPrestar)
  }
}

/** Solo el dueño. */
export async function quitarNoPrestar(clienteId: unknown): Promise<Resultado> {
  const { negocio, usuario, rol } = await obtenerContexto()
  if (!puedeGestionarCondiciones(rol)) return fallo(M.soloDuenoNoPrestar)
  const id = esquemaIdCliente.safeParse(clienteId)
  if (!id.success) return fallo(M.noEncontrado)

  try {
    await db().transaction(async (tx) => {
      const [actual] = await tx
        .select({ id: clientes.id, noPrestar: clientes.noPrestar, noPrestarMotivo: clientes.noPrestarMotivo })
        .from(clientes)
        .where(and(eq(clientes.id, id.data), eq(clientes.negocioId, negocio.id)))
        .for("update")
        .limit(1)
      if (!actual) throw new FalloControlado(fallo(M.noEncontrado))
      if (!actual.noPrestar) throw new FalloControlado(fallo(M.noEstaNoPrestar))

      await tx
        .update(clientes)
        .set({ noPrestar: false, noPrestarMotivo: null })
        .where(and(eq(clientes.id, actual.id), eq(clientes.negocioId, negocio.id)))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "cliente.quitar_no_prestar",
        entidad: ENTIDAD,
        entidadId: actual.id,
        valorAnterior: { noPrestar: true, noPrestarMotivo: actual.noPrestarMotivo },
        valorNuevo: { noPrestar: false, noPrestarMotivo: null },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "quitar no prestar", M.errorNoPrestar)
  }
}
