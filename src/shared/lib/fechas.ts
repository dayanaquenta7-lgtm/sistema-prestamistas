import { tz } from "@date-fns/tz"
import { format, isValid, parse } from "date-fns"

export const ZONA_HORARIA_POR_DEFECTO = "America/La_Paz"

/** Fecha de negocio sin hora, en formato ISO "aaaa-mm-dd" (columna date). */
export type FechaNegocio = string

const PATRON_FECHA_NEGOCIO = /^(\d{4})-(\d{2})-(\d{2})$/
const PATRON_FECHA_USUARIO = /^\d{2}\/\d{2}\/\d{4}$/

export function esFechaNegocio(texto: string): texto is FechaNegocio {
  if (!PATRON_FECHA_NEGOCIO.test(texto)) return false
  return isValid(parse(texto, "yyyy-MM-dd", new Date()))
}

/**
 * "Hoy" en la zona horaria del negocio. Nunca usar la fecha UTC del servidor:
 * en La Paz (UTC-4) a las 21:00 en UTC ya es el día siguiente.
 */
export function hoyEnZona(
  zona: string = ZONA_HORARIA_POR_DEFECTO,
  ahora: Date = new Date(),
): FechaNegocio {
  return format(ahora, "yyyy-MM-dd", { in: tz(zona) })
}

/**
 * Formatea como dd/mm/aaaa. Una fecha de negocio se formatea tal cual, sin
 * conversión de zona; un instante (timestamp) se lleva a la zona del negocio.
 */
export function formatearFecha(
  valor: FechaNegocio | Date,
  zona: string = ZONA_HORARIA_POR_DEFECTO,
): string {
  if (valor instanceof Date) {
    return format(valor, "dd/MM/yyyy", { in: tz(zona) })
  }
  const coincidencia = PATRON_FECHA_NEGOCIO.exec(valor)
  if (!coincidencia || !esFechaNegocio(valor)) {
    throw new Error(`Fecha inválida: "${valor}"`)
  }
  const [, anio, mes, dia] = coincidencia
  return `${dia}/${mes}/${anio}`
}

/** Formatea un instante como "dd/mm/aaaa hh:mm" en la zona del negocio. */
export function formatearFechaHora(
  valor: Date,
  zona: string = ZONA_HORARIA_POR_DEFECTO,
): string {
  return format(valor, "dd/MM/yyyy HH:mm", { in: tz(zona) })
}

/** Convierte "dd/mm/aaaa" escrito por el usuario a fecha de negocio, o null. */
export function parsearFechaUsuario(texto: string): FechaNegocio | null {
  const limpio = texto.trim()
  if (!PATRON_FECHA_USUARIO.test(limpio)) return null
  const fecha = parse(limpio, "dd/MM/yyyy", new Date())
  if (!isValid(fecha)) return null
  return format(fecha, "yyyy-MM-dd")
}
