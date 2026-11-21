"use server"

import { and, eq } from "drizzle-orm"
import { leerCondiciones } from "@/modules/prestamos"
import { requerirRol } from "@/shared/auth/sesion"
import { registrarAuditoria } from "@/shared/db/auditoria"
import { db } from "@/shared/db/cliente"
import { esViolacionUnica } from "@/shared/db/errores"
import { plantillasPrestamo } from "@/shared/db/schema"
import { exito, fallo, type Resultado } from "@/shared/lib/resultado"
import { validar } from "@/shared/lib/validar"
import { esquemaFormularioPlantilla, esquemaId, MENSAJES_CONFIGURACION as M } from "../esquemas/configuracion"
import { FalloControlado, manejarError } from "./comun"

const ENTIDAD = "plantilla"
const RESTRICCION_NOMBRE = "plantillas_negocio_nombre_activa_unico"

function nombreDuplicado(enCampo: boolean) {
  return (error: unknown) => {
    if (!esViolacionUnica(error, RESTRICCION_NOMBRE)) return null
    return enCampo ? fallo(M.revisarDatos, { nombre: [M.nombrePlantillaDuplicado] }) : fallo(M.nombrePlantillaDuplicado)
  }
}

/** Solo el dueño. */
export async function crearPlantilla(entrada: unknown): Promise<Resultado<{ id: string }>> {
  const { negocio, usuario } = await requerirRol("dueno")
  const validacion = validar(esquemaFormularioPlantilla, entrada)
  if (!validacion.ok) return validacion
  const { nombre, condiciones } = validacion.datos

  try {
    const id = await db().transaction(async (tx) => {
      const [plantilla] = await tx
        .insert(plantillasPrestamo)
        .values({ negocioId: negocio.id, nombre, condiciones, creadoPor: usuario.id })
        .returning({ id: plantillasPrestamo.id })
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "plantilla.crear",
        entidad: ENTIDAD,
        entidadId: plantilla.id,
        valorNuevo: { nombre, ...condiciones },
      })
      return plantilla.id
    })
    return exito({ id })
  } catch (error) {
    return manejarError(error, "crear la plantilla", nombreDuplicado(true))
  }
}

/** Solo el dueño. Editar una plantilla no cambia los préstamos ya creados (RN-01). */
export async function editarPlantilla(plantillaId: unknown, entrada: unknown): Promise<Resultado<{ id: string }>> {
  const { negocio, usuario } = await requerirRol("dueno")
  const id = esquemaId.safeParse(plantillaId)
  if (!id.success) return fallo(M.plantillaNoEncontrada)
  const validacion = validar(esquemaFormularioPlantilla, entrada)
  if (!validacion.ok) return validacion
  const { nombre, condiciones } = validacion.datos

  try {
    await db().transaction(async (tx) => {
      const [actual] = await tx
        .select()
        .from(plantillasPrestamo)
        .where(and(eq(plantillasPrestamo.id, id.data), eq(plantillasPrestamo.negocioId, negocio.id)))
        .for("update")
        .limit(1)
      if (!actual) throw new FalloControlado(fallo(M.plantillaNoEncontrada))

      const anteriores = leerCondiciones(actual.condiciones)
      const sinCambios =
        actual.nombre === nombre && anteriores !== null && JSON.stringify(anteriores) === JSON.stringify(condiciones)
      if (sinCambios) return

      await tx
        .update(plantillasPrestamo)
        .set({ nombre, condiciones })
        .where(and(eq(plantillasPrestamo.id, actual.id), eq(plantillasPrestamo.negocioId, negocio.id)))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "plantilla.editar",
        entidad: ENTIDAD,
        entidadId: actual.id,
        valorAnterior: { nombre: actual.nombre, ...(anteriores ?? {}) },
        valorNuevo: { nombre, ...condiciones },
      })
    })
    return exito({ id: id.data })
  } catch (error) {
    return manejarError(error, "editar la plantilla", nombreDuplicado(true))
  }
}

/** Solo el dueño. Las plantillas no se eliminan: se activan o desactivan. */
export async function cambiarEstadoPlantilla(plantillaId: unknown, activa: boolean): Promise<Resultado> {
  const { negocio, usuario } = await requerirRol("dueno")
  const id = esquemaId.safeParse(plantillaId)
  if (!id.success || typeof activa !== "boolean") return fallo(M.plantillaNoEncontrada)

  try {
    await db().transaction(async (tx) => {
      const [actual] = await tx
        .select({ id: plantillasPrestamo.id, activa: plantillasPrestamo.activa })
        .from(plantillasPrestamo)
        .where(and(eq(plantillasPrestamo.id, id.data), eq(plantillasPrestamo.negocioId, negocio.id)))
        .for("update")
        .limit(1)
      if (!actual) throw new FalloControlado(fallo(M.plantillaNoEncontrada))
      if (actual.activa === activa) {
        throw new FalloControlado(fallo(activa ? M.plantillaYaActiva : M.plantillaYaInactiva))
      }

      await tx
        .update(plantillasPrestamo)
        .set({ activa })
        .where(and(eq(plantillasPrestamo.id, actual.id), eq(plantillasPrestamo.negocioId, negocio.id)))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: activa ? "plantilla.activar" : "plantilla.desactivar",
        entidad: ENTIDAD,
        entidadId: actual.id,
        valorAnterior: { activa: actual.activa },
        valorNuevo: { activa },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "cambiar el estado de la plantilla", nombreDuplicado(false))
  }
}
