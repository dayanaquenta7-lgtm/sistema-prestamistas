import { aDecimal, Decimal } from "./dinero"

const PATRON_TASA = /^\d{1,3}([.,]\d{1,4})?$/

/**
 * Tasa escrita por el usuario ("2,5" o "2.5", hasta 4 decimales) en texto canónico
 * con 4 decimales ("2.5000"), como se guarda en numeric(9,4). Null si el texto no es válido.
 */
export function parsearTasa(texto: string): string | null {
  const limpio = texto.trim().replace(/\s*%$/, "")
  if (!PATRON_TASA.test(limpio)) return null
  return new Decimal(limpio.replace(",", ".")).toFixed(4)
}

/** Tasa canónica para mostrar en un formulario o ficha: "2.5000" → "2,5". */
export function formatearTasa(tasa: string): string {
  return aDecimal(tasa).toString().replace(".", ",")
}

/** Compara dos tasas canónicas (o null) por valor, no por texto. */
export function tasasIguales(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return a === b
  return aDecimal(a).equals(aDecimal(b))
}
