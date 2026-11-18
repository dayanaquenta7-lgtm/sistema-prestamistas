"use server"

import { and, eq, isNull } from "drizzle-orm"
import { redirect } from "next/navigation"
import { guardarNegocioActivo } from "@/shared/auth/cookie-negocio"
import { esCodigoInvitacion, RUTA_INICIO_PANEL, RUTA_LOGIN, rutaInvitacion } from "@/shared/auth/rutas"
import { leerUsuario } from "@/shared/auth/sesion"
import { registrarAuditoria } from "@/shared/db/auditoria"
import { db } from "@/shared/db/cliente"
import { describirErrorDb, esViolacionUnica } from "@/shared/db/errores"
import { invitaciones, membresias, perfiles } from "@/shared/db/schema"
import { fallo, type Resultado } from "@/shared/lib/resultado"
import { validar } from "@/shared/lib/validar"
import { evaluarInvitacion, hashCodigoInvitacion, type ResultadoEvaluacion } from "../dominio/invitaciones"
import { esquemaAceptarInvitacion, esquemaNombrePerfil } from "../esquemas/acceso"
import { MENSAJE_INVITACION_NO_DISPONIBLE, MENSAJES_USUARIOS as M } from "../mensajes-invitacion"

class FalloControlado extends Error {
  constructor(readonly resultado: ReturnType<typeof fallo>) {
    super(resultado.error)
  }
}

const MENSAJE_POR_RESULTADO: Record<Exclude<ResultadoEvaluacion, "valida">, string> = {
  no_disponible: MENSAJE_INVITACION_NO_DISPONIBLE,
  es_dueno: M.esDueno,
  ya_miembro_activo: M.yaMiembroActivo,
  ya_miembro_inactivo: M.yaMiembroInactivo,
}

/**
 * Acepta una invitación (RN-13). En una transacción con bloqueo de la fila de la
 * invitación: valida que siga pendiente, crea el perfil si falta, crea la
 * membresía de ayudante y marca la invitación como usada. Dos aceptaciones
 * simultáneas se serializan; la segunda encuentra la invitación ya usada. La
 * restricción única de membresías es la segunda barrera.
 */
export async function aceptarInvitacion(codigo: unknown, entrada: unknown): Promise<Resultado> {
  if (!esCodigoInvitacion(codigo)) return fallo(MENSAJE_INVITACION_NO_DISPONIBLE)
  const usuario = await leerUsuario()
  if (!usuario) redirect(`${RUTA_LOGIN}?siguiente=${encodeURIComponent(rutaInvitacion(codigo))}`)
  const validacion = validar(esquemaAceptarInvitacion, entrada)
  if (!validacion.ok) return validacion

  let negocioId: string
  try {
    negocioId = await db().transaction(async (tx) => {
      const [invitacion] = await tx
        .select()
        .from(invitaciones)
        .where(eq(invitaciones.codigoHash, hashCodigoInvitacion(codigo)))
        .for("update")
        .limit(1)
      if (!invitacion) throw new FalloControlado(fallo(MENSAJE_INVITACION_NO_DISPONIBLE))

      const [membresia] = await tx
        .select({ rol: membresias.rol, activo: membresias.activo })
        .from(membresias)
        .where(and(eq(membresias.negocioId, invitacion.negocioId), eq(membresias.usuarioId, usuario.id)))
        .limit(1)
      const evaluacion = evaluarInvitacion({
        invitacion,
        ahora: new Date(),
        esDueno: membresia?.rol === "dueno",
        membresia: membresia ?? null,
      })
      if (evaluacion !== "valida") throw new FalloControlado(fallo(MENSAJE_POR_RESULTADO[evaluacion]))

      const [perfil] = await tx.select({ id: perfiles.id }).from(perfiles).where(eq(perfiles.id, usuario.id)).limit(1)
      if (!perfil) {
        const nombre = validar(esquemaNombrePerfil, validacion.datos)
        if (!nombre.ok) throw new FalloControlado(nombre)
        await tx.insert(perfiles).values({ id: usuario.id, nombre: nombre.datos.nombre }).onConflictDoNothing()
      }

      const [nueva] = await tx
        .insert(membresias)
        .values({
          negocioId: invitacion.negocioId,
          usuarioId: usuario.id,
          rol: "ayudante",
          puedeCrearPrestamos: invitacion.puedeCrearPrestamos,
          // Quien autorizó el acceso: el dueño que generó la invitación.
          creadoPor: invitacion.creadoPor,
        })
        .returning({ id: membresias.id })

      const usadaEn = new Date()
      const [usada] = await tx
        .update(invitaciones)
        .set({ usadaEn, usadaPor: usuario.id })
        .where(and(eq(invitaciones.id, invitacion.id), isNull(invitaciones.usadaEn), isNull(invitaciones.revocadaEn)))
        .returning({ id: invitaciones.id })
      if (!usada) throw new FalloControlado(fallo(MENSAJE_INVITACION_NO_DISPONIBLE))

      await registrarAuditoria(tx, {
        negocioId: invitacion.negocioId,
        usuarioId: usuario.id,
        accion: "invitacion.aceptar",
        entidad: "invitacion",
        entidadId: invitacion.id,
        valorNuevo: { membresiaId: nueva.id, puedeCrearPrestamos: invitacion.puedeCrearPrestamos, usadaEn },
      })
      return invitacion.negocioId
    })
  } catch (error) {
    if (error instanceof FalloControlado) return error.resultado
    if (esViolacionUnica(error, "membresias_negocio_usuario_unico")) return fallo(M.yaMiembroActivo)
    console.error(`[invitaciones] Error al aceptar: ${describirErrorDb(error)}`)
    return fallo(M.errorAceptar)
  }

  // Entra directamente al negocio al que se acaba de unir.
  await guardarNegocioActivo(negocioId)
  redirect(RUTA_INICIO_PANEL)
}
