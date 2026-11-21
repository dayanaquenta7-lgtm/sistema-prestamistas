import type { Rol } from "@/shared/auth/permisos"

export const MENSAJES_MEMBRESIAS = {
  noDesactivarseASiMismo: "No puedes desactivar tu propio acceso.",
  noCambiarPropiosPermisos: "No puedes cambiar tus propios permisos.",
  soloAyudantes: "Solo se pueden modificar los ayudantes del negocio.",
  yaActivo: "Este ayudante ya está activo.",
  yaInactivo: "Este ayudante ya está desactivado.",
  permisoSinCambios: "El permiso ya tiene ese valor.",
} as const

export interface MembresiaObjetivo {
  usuarioId: string
  rol: Rol
  activo: boolean
  puedeCrearPrestamos: boolean
}

export type CambioMembresia = { tipo: "activo"; valor: boolean } | { tipo: "permiso"; valor: boolean }

/**
 * Reglas para que el dueño modifique una membresía. En el MVP hay un solo dueño
 * por negocio: nunca se modifica la membresía de un dueño, ni la propia.
 * Devuelve el mensaje de error o null si el cambio es válido.
 */
export function validarCambioMembresia(
  usuarioActual: string,
  objetivo: MembresiaObjetivo,
  cambio: CambioMembresia,
): string | null {
  const M = MENSAJES_MEMBRESIAS
  if (objetivo.usuarioId === usuarioActual) {
    return cambio.tipo === "activo" ? M.noDesactivarseASiMismo : M.noCambiarPropiosPermisos
  }
  if (objetivo.rol !== "ayudante") return M.soloAyudantes
  if (cambio.tipo === "activo") {
    if (objetivo.activo === cambio.valor) return cambio.valor ? M.yaActivo : M.yaInactivo
    return null
  }
  return objetivo.puedeCrearPrestamos === cambio.valor ? M.permisoSinCambios : null
}
