/** Cookie con el negocio elegido en el selector. Solo es una preferencia: se valida en cada solicitud. */
export const COOKIE_NEGOCIO_ACTIVO = "negocio_activo"

/**
 * Elige la membresía de la solicitud entre las activas del usuario (ordenadas de
 * la más antigua a la más nueva). La cookie solo se respeta si coincide con una
 * membresía activa; si no, se usa la más antigua. Así una cookie manipulada o de
 * un negocio donde el usuario fue desactivado nunca da acceso.
 */
export function elegirMembresia<T extends { negocio: { id: string } }>(
  membresias: readonly T[],
  negocioPreferido: string | undefined,
): T | null {
  return membresias.find((membresia) => membresia.negocio.id === negocioPreferido) ?? membresias[0] ?? null
}
