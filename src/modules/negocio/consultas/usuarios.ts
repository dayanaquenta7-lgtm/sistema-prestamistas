import "server-only"
import { and, asc, desc, eq, gt, isNull } from "drizzle-orm"
import type { Rol } from "@/shared/auth/permisos"
import { db } from "@/shared/db/cliente"
import { invitaciones, membresias, negocios, perfiles } from "@/shared/db/schema"
import { hashCodigoInvitacion } from "../dominio/invitaciones"

export interface Miembro {
  membresiaId: string
  usuarioId: string
  nombre: string
  rol: Rol
  activo: boolean
  puedeCrearPrestamos: boolean
}

/** Miembros del negocio de la sesión: primero el dueño, luego los ayudantes por antigüedad. */
export async function listarMiembros(negocioId: string): Promise<Miembro[]> {
  return db()
    .select({
      membresiaId: membresias.id,
      usuarioId: membresias.usuarioId,
      nombre: perfiles.nombre,
      rol: membresias.rol,
      activo: membresias.activo,
      puedeCrearPrestamos: membresias.puedeCrearPrestamos,
    })
    .from(membresias)
    .innerJoin(perfiles, eq(perfiles.id, membresias.usuarioId))
    .where(eq(membresias.negocioId, negocioId))
    .orderBy(asc(membresias.rol), asc(membresias.creadoEn))
}

export interface InvitacionPendiente {
  id: string
  puedeCrearPrestamos: boolean
  creadoEn: Date
  venceEn: Date
}

export async function listarInvitacionesPendientes(negocioId: string, ahora: Date): Promise<InvitacionPendiente[]> {
  return db()
    .select({
      id: invitaciones.id,
      puedeCrearPrestamos: invitaciones.puedeCrearPrestamos,
      creadoEn: invitaciones.creadoEn,
      venceEn: invitaciones.venceEn,
    })
    .from(invitaciones)
    .where(
      and(
        eq(invitaciones.negocioId, negocioId),
        isNull(invitaciones.usadaEn),
        isNull(invitaciones.revocadaEn),
        gt(invitaciones.venceEn, ahora),
      ),
    )
    .orderBy(desc(invitaciones.creadoEn))
}

export interface InvitacionEncontrada {
  negocioId: string
  negocioNombre: string
  usadaEn: Date | null
  revocadaEn: Date | null
  venceEn: Date
}

/**
 * Busca la invitación por el hash del código (RN-13). Es la única consulta cuyo
 * negocio no sale de la sesión: sale de la invitación guardada, nunca del cliente.
 */
export async function buscarInvitacion(codigo: string): Promise<InvitacionEncontrada | null> {
  const [fila] = await db()
    .select({
      negocioId: invitaciones.negocioId,
      negocioNombre: negocios.nombre,
      usadaEn: invitaciones.usadaEn,
      revocadaEn: invitaciones.revocadaEn,
      venceEn: invitaciones.venceEn,
    })
    .from(invitaciones)
    .innerJoin(negocios, eq(negocios.id, invitaciones.negocioId))
    .where(eq(invitaciones.codigoHash, hashCodigoInvitacion(codigo)))
    .limit(1)
  return fila ?? null
}

/** Membresía (activa o no) del usuario en un negocio. */
export async function membresiaEnNegocio(
  usuarioId: string,
  negocioId: string,
): Promise<{ rol: Rol; activo: boolean } | null> {
  const [fila] = await db()
    .select({ rol: membresias.rol, activo: membresias.activo })
    .from(membresias)
    .where(and(eq(membresias.usuarioId, usuarioId), eq(membresias.negocioId, negocioId)))
    .limit(1)
  return fila ?? null
}

export async function tienePerfil(usuarioId: string): Promise<boolean> {
  const [fila] = await db().select({ id: perfiles.id }).from(perfiles).where(eq(perfiles.id, usuarioId)).limit(1)
  return Boolean(fila)
}
