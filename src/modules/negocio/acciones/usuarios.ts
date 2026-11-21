"use server"

import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { rutaInvitacion } from "@/shared/auth/rutas"
import { requerirRol } from "@/shared/auth/sesion"
import { registrarAuditoria } from "@/shared/db/auditoria"
import { db } from "@/shared/db/cliente"
import { describirErrorDb } from "@/shared/db/errores"
import { invitaciones, membresias } from "@/shared/db/schema"
import { formatearFecha } from "@/shared/lib/fechas"
import { exito, fallo, type Resultado } from "@/shared/lib/resultado"
import {
  calcularVencimiento,
  estaPendiente,
  generarCodigoInvitacion,
  hashCodigoInvitacion,
} from "../dominio/invitaciones"
import { validarCambioMembresia, type CambioMembresia } from "../dominio/membresias"
import { MENSAJES_USUARIOS as M } from "../mensajes-invitacion"
import { origenApp } from "./origen"

class FalloControlado extends Error {
  constructor(readonly resultado: ReturnType<typeof fallo>) {
    super(resultado.error)
  }
}

function manejarError(error: unknown, contexto: string) {
  if (error instanceof FalloControlado) return error.resultado
  console.error(`[usuarios] Error al ${contexto}: ${describirErrorDb(error)}`)
  return fallo(M.errorGuardar)
}

const esquemaNuevaInvitacion = z.object({ puedeCrearPrestamos: z.boolean() })
const esquemaId = z.uuid()

export interface InvitacionGenerada {
  enlace: string
  venceEl: string
  negocio: string
}

/**
 * Solo el dueño. El código se devuelve una sola vez para mostrarlo y compartirlo;
 * en la base queda solo su hash (RN-13).
 */
export async function crearInvitacion(entrada: unknown): Promise<Resultado<InvitacionGenerada>> {
  const { negocio, usuario } = await requerirRol("dueno")
  const datos = esquemaNuevaInvitacion.safeParse(entrada)
  if (!datos.success) return fallo(M.errorGuardar)

  const codigo = generarCodigoInvitacion()
  const venceEn = calcularVencimiento(new Date())
  try {
    await db().transaction(async (tx) => {
      const [invitacion] = await tx
        .insert(invitaciones)
        .values({
          negocioId: negocio.id,
          codigoHash: hashCodigoInvitacion(codigo),
          puedeCrearPrestamos: datos.data.puedeCrearPrestamos,
          venceEn,
          creadoPor: usuario.id,
        })
        .returning({ id: invitaciones.id })
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "invitacion.crear",
        entidad: "invitacion",
        entidadId: invitacion.id,
        // Nunca el código ni su hash.
        valorNuevo: { puedeCrearPrestamos: datos.data.puedeCrearPrestamos, venceEn },
      })
    })
  } catch (error) {
    return manejarError(error, "crear la invitación")
  }

  return exito({
    enlace: `${await origenApp()}${rutaInvitacion(codigo)}`,
    venceEl: formatearFecha(venceEn, negocio.zonaHoraria),
    negocio: negocio.nombre,
  })
}

/** Solo el dueño. Una invitación revocada ya no se puede aceptar. */
export async function revocarInvitacion(invitacionId: unknown): Promise<Resultado> {
  const { negocio, usuario } = await requerirRol("dueno")
  const id = esquemaId.safeParse(invitacionId)
  if (!id.success) return fallo(M.invitacionNoPendiente)

  try {
    await db().transaction(async (tx) => {
      const [actual] = await tx
        .select()
        .from(invitaciones)
        .where(and(eq(invitaciones.id, id.data), eq(invitaciones.negocioId, negocio.id)))
        .for("update")
        .limit(1)
      const ahora = new Date()
      if (!actual || !estaPendiente(actual, ahora)) throw new FalloControlado(fallo(M.invitacionNoPendiente))

      await tx
        .update(invitaciones)
        .set({ revocadaEn: ahora, revocadaPor: usuario.id })
        .where(and(eq(invitaciones.id, actual.id), eq(invitaciones.negocioId, negocio.id), isNull(invitaciones.usadaEn)))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion: "invitacion.revocar",
        entidad: "invitacion",
        entidadId: actual.id,
        valorAnterior: { revocadaEn: null },
        valorNuevo: { revocadaEn: ahora },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "revocar la invitación")
  }
}

async function cambiarMembresia(membresiaId: unknown, cambio: CambioMembresia): Promise<Resultado> {
  const { negocio, usuario } = await requerirRol("dueno")
  const id = esquemaId.safeParse(membresiaId)
  if (!id.success || typeof cambio.valor !== "boolean") return fallo(M.miembroNoEncontrado)

  try {
    await db().transaction(async (tx) => {
      const [actual] = await tx
        .select()
        .from(membresias)
        .where(and(eq(membresias.id, id.data), eq(membresias.negocioId, negocio.id)))
        .for("update")
        .limit(1)
      if (!actual) throw new FalloControlado(fallo(M.miembroNoEncontrado))

      // El dueño no puede desactivarse ni cambiar sus propios permisos (validado aquí, en el servidor).
      const error = validarCambioMembresia(usuario.id, actual, cambio)
      if (error) throw new FalloControlado(fallo(error))

      const campo = cambio.tipo === "activo" ? "activo" : "puedeCrearPrestamos"
      await tx
        .update(membresias)
        .set({ [campo]: cambio.valor })
        .where(and(eq(membresias.id, actual.id), eq(membresias.negocioId, negocio.id)))
      await registrarAuditoria(tx, {
        negocioId: negocio.id,
        usuarioId: usuario.id,
        accion:
          cambio.tipo === "permiso"
            ? "membresia.cambiar_permiso"
            : cambio.valor
              ? "membresia.activar"
              : "membresia.desactivar",
        entidad: "membresia",
        entidadId: actual.id,
        valorAnterior: { [campo]: actual[campo] },
        valorNuevo: { [campo]: cambio.valor },
      })
    })
    return exito()
  } catch (error) {
    return manejarError(error, "actualizar la membresía")
  }
}

/** Solo el dueño. Un ayudante desactivado pierde el acceso en su siguiente solicitud. */
export async function cambiarActivoMembresia(membresiaId: unknown, activo: boolean): Promise<Resultado> {
  return cambiarMembresia(membresiaId, { tipo: "activo", valor: activo })
}

/** Solo el dueño. Da o quita el permiso de crear préstamos a un ayudante. */
export async function cambiarPermisoMembresia(membresiaId: unknown, puedeCrearPrestamos: boolean): Promise<Resultado> {
  return cambiarMembresia(membresiaId, { tipo: "permiso", valor: puedeCrearPrestamos })
}
