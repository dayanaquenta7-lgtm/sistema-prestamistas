/** Estados de préstamo (docs/alcance.md, RN-07) que intervienen en el estado del cliente. */
export type EstadoPrestamo = "vigente" | "en-mora" | "cancelado" | "refinanciado" | "anulado"

export type EstadoCliente = "sin-prestamos" | "al-dia" | "en-mora"

/**
 * Estado derivado del cliente (docs/alcance.md, 2.2 y RN-07). No se guarda:
 * - "en-mora" si algún préstamo está en mora.
 * - "al-dia" si tiene algún préstamo vigente y ninguno en mora.
 * - "sin-prestamos" en otro caso, también si solo tiene préstamos cancelados,
 *   refinanciados o anulados.
 */
export function derivarEstadoCliente(estadosPrestamos: readonly EstadoPrestamo[]): EstadoCliente {
  if (estadosPrestamos.includes("en-mora")) return "en-mora"
  if (estadosPrestamos.includes("vigente")) return "al-dia"
  return "sin-prestamos"
}
