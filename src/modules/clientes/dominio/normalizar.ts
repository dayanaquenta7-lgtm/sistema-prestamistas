/** Texto opcional: recorta espacios y devuelve null si queda vacío. */
export function textoOpcional(texto: string | null | undefined): string | null {
  const limpio = (texto ?? "").trim()
  return limpio === "" ? null : limpio
}

/**
 * CI normalizado para comparar y guardar: sin espacios en los extremos, espacios
 * internos colapsados y en mayúsculas ("1234567 lp" → "1234567 LP"). Null si vacío.
 */
export function normalizarCi(texto: string | null | undefined): string | null {
  const limpio = textoOpcional(texto)
  return limpio === null ? null : limpio.replace(/\s+/g, " ").toUpperCase()
}
