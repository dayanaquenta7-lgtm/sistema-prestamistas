"use server"

import { and, eq } from "drizzle-orm"
import { requerirRol } from "@/shared/auth/sesion"
import { registrarAuditoria } from "@/shared/db/auditoria"
import { db } from "@/shared/db/cliente"
import { esViolacionUnica } from "@/shared/db/errores"
import { feriados } from "@/shared/db/schema"
import { exito, fallo, type Resultado } from "@/shared/lib/resultado"
import { validar } from "@/shared/lib/validar"
import { esquemaFeriado, esquemaId, MENSAJES_CONFIGURACION as M } from "../esquemas/configuracion"
import { FalloControlado, manejarError } from "./comun"

const ENTIDAD = "feriado"

/** Solo el dueño. Fecha única por negocio. */
export async function agregarFeriado(entrada: unknown): Promise<Resultado> {
  const { negocio, usuario } = await requerirRol("dueno")
  const validacion = validar(esquemaFeriado, entrada)
  if (!validacion.ok) return validacion
  const datos = validacion.datos

  try {
    await db().transaction(async (tx) => {
      const [feriado] = await tx
        .insert(feriados)
        .values({ ...datos, negocioId: negocio.id, creadoPor: usuario.id })
        .returning({ id: feriados.id })
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "feriado.crear",
        entidad: ENTIDAD,
        entidadId: feriado.id,
        valorNuevo: { ...datos },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "agregar el feriado", (e) =>
      esViolacionUnica(e, "feriados_negocio_fecha_unico") ? fallo(M.revisarDatos, { fecha: [M.feriadoDuplicado] }) : null,
    )
  }
}

/**
 * Solo el dueño. Se borra (es configuración, no un registro financiero) y queda en
 * auditoría. No afecta préstamos existentes: sus fechas se fijan al desembolsar.
 */
export async function quitarFeriado(feriadoId: unknown): Promise<Resultado> {
  const { negocio, usuario } = await requerirRol("dueno")
  const id = esquemaId.safeParse(feriadoId)
  if (!id.success) return fallo(M.feriadoNoEncontrado)

  try {
    await db().transaction(async (tx) => {
      const [quitado] = await tx
        .delete(feriados)
        .where(and(eq(feriados.id, id.data), eq(feriados.negocioId, negocio.id)))
        .returning({ id: feriados.id, fecha: feriados.fecha, descripcion: feriados.descripcion })
      if (!quitado) throw new FalloControlado(fallo(M.feriadoNoEncontrado))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "feriado.quitar",
        entidad: ENTIDAD,
        entidadId: quitado.id,
        valorAnterior: { fecha: quitado.fecha, descripcion: quitado.descripcion },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "quitar el feriado")
  }
}
