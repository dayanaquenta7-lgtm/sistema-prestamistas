"use server"

import { eq } from "drizzle-orm"
import { leerCondiciones } from "@/modules/prestamos"
import { requerirRol } from "@/shared/auth/sesion"
import { registrarAuditoria } from "@/shared/db/auditoria"
import { db, type Transaccion } from "@/shared/db/cliente"
import { negocios } from "@/shared/db/schema"
import { exito, fallo, type Resultado } from "@/shared/lib/resultado"
import { tasasIguales } from "@/shared/lib/tasas"
import { validar } from "@/shared/lib/validar"
import { esquemaDatosNegocio, esquemaFormularioDefecto, esquemaTope } from "../esquemas/configuracion"
import { FalloControlado, manejarError } from "./comun"

const ENTIDAD = "negocio"

async function bloquearNegocio(tx: Transaccion, id: string) {
  const [actual] = await tx.select().from(negocios).where(eq(negocios.id, id)).for("update").limit(1)
  if (!actual) throw new FalloControlado(fallo("No encontramos tu negocio."))
  return actual
}

/** Solo el dueño. Moneda y zona horaria no se editan en el MVP. */
export async function guardarDatosNegocio(entrada: unknown): Promise<Resultado> {
  const { negocio, usuario } = await requerirRol("dueno")
  const validacion = validar(esquemaDatosNegocio, entrada)
  if (!validacion.ok) return validacion
  const { nombre } = validacion.datos

  try {
    await db().transaction(async (tx) => {
      const actual = await bloquearNegocio(tx, negocio.id)
      if (actual.nombre === nombre) return
      await tx.update(negocios).set({ nombre }).where(eq(negocios.id, negocio.id))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "negocio.editar",
        entidad: ENTIDAD,
        entidadId: negocio.id,
        valorAnterior: { nombre: actual.nombre },
        valorNuevo: { nombre },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "guardar los datos del negocio")
  }
}

/** Solo el dueño. El tope es una advertencia, no un bloqueo (RN-09, art. 409 del Código Civil). */
export async function guardarTope(entrada: unknown): Promise<Resultado> {
  const { negocio, usuario } = await requerirRol("dueno")
  const validacion = validar(esquemaTope, entrada)
  if (!validacion.ok) return validacion
  const { tope } = validacion.datos

  try {
    await db().transaction(async (tx) => {
      const actual = await bloquearNegocio(tx, negocio.id)
      if (tasasIguales(actual.topeTasaMensual, tope)) return
      await tx.update(negocios).set({ topeTasaMensual: tope }).where(eq(negocios.id, negocio.id))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "negocio.cambiar_tope",
        entidad: ENTIDAD,
        entidadId: negocio.id,
        valorAnterior: { topeTasaMensual: actual.topeTasaMensual },
        valorNuevo: { topeTasaMensual: tope },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "guardar el tope legal")
  }
}

/**
 * Solo el dueño. Precargan las plantillas nuevas; cambiarlas no altera
 * plantillas ni préstamos existentes (RN-01).
 */
export async function guardarCondicionesDefecto(entrada: unknown): Promise<Resultado> {
  const { negocio, usuario } = await requerirRol("dueno")
  const validacion = validar(esquemaFormularioDefecto, entrada)
  if (!validacion.ok) return validacion
  const { condiciones } = validacion.datos

  try {
    await db().transaction(async (tx) => {
      const actual = await bloquearNegocio(tx, negocio.id)
      const anterior = actual.condicionesDefecto === null ? null : leerCondiciones(actual.condicionesDefecto)
      if (anterior && JSON.stringify(anterior) === JSON.stringify(condiciones)) return
      await tx.update(negocios).set({ condicionesDefecto: condiciones }).where(eq(negocios.id, negocio.id))
      // Se audita parámetro por parámetro: registrarAuditoria conserva solo los que cambiaron.
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "condiciones.editar",
        entidad: ENTIDAD,
        entidadId: negocio.id,
        valorAnterior: anterior ? { ...anterior } : null,
        valorNuevo: { ...condiciones },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "guardar las condiciones por defecto")
  }
}
