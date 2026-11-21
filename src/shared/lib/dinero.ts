import { Decimal as DecimalJs } from "decimal.js"

/**
 * Constructor de Decimal propio del sistema. Se clona para no alterar la
 * configuración global de decimal.js que pudieran usar otras librerías.
 */
export const Decimal = DecimalJs.clone({
  precision: 40,
  rounding: DecimalJs.ROUND_HALF_UP,
  toExpNeg: -40,
  toExpPos: 40,
})

export type Decimal = DecimalJs

const PATRON_NUMERICO = /^-?\d+(\.\d+)?$/

/**
 * Convierte a Decimal un valor que viene de la base de datos (numeric llega
 * como texto) o que ya es Decimal. No acepta number a propósito.
 */
export function aDecimal(valor: string | DecimalJs): Decimal {
  if (DecimalJs.isDecimal(valor)) {
    return new Decimal(valor)
  }
  const texto = valor.trim()
  if (!PATRON_NUMERICO.test(texto)) {
    throw new Error(`Valor numérico inválido: "${valor}"`)
  }
  return new Decimal(texto)
}

export function redondear2(valor: DecimalJs): Decimal {
  return new Decimal(valor).toDecimalPlaces(2, DecimalJs.ROUND_HALF_UP)
}

function agruparMiles(entero: string): string {
  return entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

/** Formatea sin símbolo: "1.234,56". */
export function formatearNumero(valor: string | DecimalJs): string {
  const redondeado = redondear2(aDecimal(valor))
  const negativo = redondeado.isNegative() && !redondeado.isZero()
  const [entero, decimales] = redondeado.abs().toFixed(2).split(".")
  return `${negativo ? "-" : ""}${agruparMiles(entero)},${decimales}`
}

/** Formatea con símbolo de bolivianos: "Bs 1.234,56" / "-Bs 1.234,56". */
export function formatearMonto(valor: string | DecimalJs): string {
  const texto = formatearNumero(valor)
  return texto.startsWith("-") ? `-Bs ${texto.slice(1)}` : `Bs ${texto}`
}

const CON_COMA = /^\d{1,3}(\.\d{3})*,\d{1,2}$|^\d+,\d{1,2}$/
const SOLO_MILES = /^\d{1,3}(\.\d{3})+$/
const PUNTO_DECIMAL = /^\d+\.\d{1,2}$/
const ENTERO = /^\d+$/

/**
 * Interpreta un monto escrito por el usuario en formato boliviano.
 * - La coma es el separador decimal; los puntos, de miles ("1.234,56").
 * - Sin coma, un punto seguido de grupos de 3 dígitos es de miles ("1.234" = 1234).
 * - Sin coma, un único punto con 1 o 2 decimales es decimal ("12.5"), para
 *   teclados numéricos de celular que solo ofrecen punto.
 * Devuelve null si el texto no es un monto válido no negativo con hasta 2 decimales.
 */
export function parsearMonto(texto: string): Decimal | null {
  const limpio = texto.trim().replace(/^Bs\s*/i, "").replace(/\s/g, "")
  if (limpio === "") return null

  if (limpio.includes(",")) {
    if (!CON_COMA.test(limpio)) return null
    return new Decimal(limpio.replace(/\./g, "").replace(",", "."))
  }
  if (SOLO_MILES.test(limpio)) return new Decimal(limpio.replace(/\./g, ""))
  if (PUNTO_DECIMAL.test(limpio) || ENTERO.test(limpio)) return new Decimal(limpio)
  return null
}
