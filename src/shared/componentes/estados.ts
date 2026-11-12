/** Tonos visuales; cada uno tiene variables CSS --estado-<tono>-fondo y -texto. */
export type TonoEstado =
  | "vigente"
  | "por-vencer"
  | "mora"
  | "cancelado"
  | "refinanciado"
  | "anulado"
  | "neutro"

/** Estados de docs/alcance.md (RN-07 y sección 2.2). */
export type Estado =
  // Préstamo
  | "vigente"
  | "en-mora"
  | "cancelado"
  | "refinanciado"
  | "anulado"
  // Cuota
  | "pendiente"
  | "por-vencer"
  | "vencida"
  | "parcial"
  | "pagada"
  // Cliente
  | "sin-prestamos"
  | "al-dia"

export const ESTADOS: Record<Estado, { etiqueta: string; tono: TonoEstado }> = {
  vigente: { etiqueta: "Vigente", tono: "vigente" },
  "en-mora": { etiqueta: "En mora", tono: "mora" },
  cancelado: { etiqueta: "Cancelado", tono: "cancelado" },
  refinanciado: { etiqueta: "Refinanciado", tono: "refinanciado" },
  anulado: { etiqueta: "Anulado", tono: "anulado" },
  pendiente: { etiqueta: "Pendiente", tono: "neutro" },
  "por-vencer": { etiqueta: "Por vencer", tono: "por-vencer" },
  vencida: { etiqueta: "Vencida", tono: "mora" },
  parcial: { etiqueta: "Parcial", tono: "neutro" },
  pagada: { etiqueta: "Pagada", tono: "cancelado" },
  "sin-prestamos": { etiqueta: "Sin préstamos", tono: "neutro" },
  "al-dia": { etiqueta: "Al día", tono: "vigente" },
}
