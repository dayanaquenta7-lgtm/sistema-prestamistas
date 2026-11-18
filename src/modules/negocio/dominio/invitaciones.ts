import { createHash, randomBytes } from "node:crypto"

/** RN-13: un enlace de invitación vence a los 7 días. */
export const VIGENCIA_INVITACION_DIAS = 7

/** 32 bytes aleatorios en base64url: 43 caracteres, imposible de adivinar. */
export function generarCodigoInvitacion(): string {
  return randomBytes(32).toString("base64url")
}

/**
 * En la base se guarda solo el hash del código (RN-13). Con 256 bits de
 * entropía no hace falta sal: no hay diccionario posible.
 */
export function hashCodigoInvitacion(codigo: string): string {
  return createHash("sha256").update(codigo).digest("hex")
}

export function calcularVencimiento(ahora: Date): Date {
  return new Date(ahora.getTime() + VIGENCIA_INVITACION_DIAS * 24 * 60 * 60 * 1000)
}

export interface EstadoInvitacion {
  usadaEn: Date | null
  revocadaEn: Date | null
  venceEn: Date
}

export function estaPendiente(invitacion: EstadoInvitacion, ahora: Date): boolean {
  return invitacion.usadaEn === null && invitacion.revocadaEn === null && invitacion.venceEn > ahora
}

export type ResultadoEvaluacion = "valida" | "no_disponible" | "es_dueno" | "ya_miembro_activo" | "ya_miembro_inactivo"

export interface DatosEvaluacion {
  invitacion: EstadoInvitacion | null
  ahora: Date
  /** El usuario es el dueño del negocio que invita. */
  esDueno: boolean
  /** Membresía previa del usuario en ese negocio, si la tiene. */
  membresia: { activo: boolean } | null
}

/**
 * Qué ocurre cuando un usuario con sesión abre o acepta una invitación.
 * - Inexistente, usada, revocada o vencida: "no_disponible", sin revelar el motivo.
 * - El dueño que abre su propio enlace no lo consume.
 * - Un miembro activo ya está dentro; uno desactivado no se reactiva con un enlace:
 *   la reactivación es una decisión explícita del dueño.
 */
export function evaluarInvitacion({ invitacion, ahora, esDueno, membresia }: DatosEvaluacion): ResultadoEvaluacion {
  if (!invitacion) return "no_disponible"
  if (esDueno) return "es_dueno"
  if (membresia) return membresia.activo ? "ya_miembro_activo" : "ya_miembro_inactivo"
  return estaPendiente(invitacion, ahora) ? "valida" : "no_disponible"
}
