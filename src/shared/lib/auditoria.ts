import { Decimal as DecimalJs } from "decimal.js"

export type ValorJson =
  | string
  | number
  | boolean
  | null
  | ValorJson[]
  | { [clave: string]: ValorJson }

export type ObjetoJson = { [clave: string]: ValorJson }

/** Valores que se pueden pasar a la auditoría; se normalizan a JSON. */
export type ValorAuditable =
  | ValorJson
  | DecimalJs
  | Date
  | undefined
  | ValorAuditable[]
  | { [clave: string]: ValorAuditable }

export interface DatosAuditoria {
  negocioId: string
  usuarioId: string
  /** Formato "entidad.verbo", por ejemplo "negocio.crear" o "pago.anular". */
  accion: string
  entidad: string
  entidadId: string | null
  valorAnterior?: { [clave: string]: ValorAuditable } | null
  valorNuevo?: { [clave: string]: ValorAuditable } | null
}

export interface RegistroAuditoria {
  negocioId: string
  usuarioId: string
  accion: string
  entidad: string
  entidadId: string | null
  valorAnterior: ObjetoJson | null
  valorNuevo: ObjetoJson | null
}

const PATRON_ACCION = /^[a-z_]+(\.[a-z_]+)+$/

/**
 * Normaliza a JSON: los Decimal se guardan como texto para no perder
 * precisión, las fechas en ISO y los undefined se omiten.
 */
export function normalizarValor(valor: ValorAuditable): ValorJson | undefined {
  if (valor === undefined) return undefined
  if (valor === null) return null
  if (DecimalJs.isDecimal(valor)) return valor.toString()
  if (valor instanceof Date) return valor.toISOString()
  if (Array.isArray(valor)) {
    return valor.map((elemento) => normalizarValor(elemento) ?? null)
  }
  if (typeof valor === "object") {
    return normalizarObjeto(valor)
  }
  return valor
}

function normalizarObjeto(objeto: { [clave: string]: ValorAuditable }): ObjetoJson {
  const resultado: ObjetoJson = {}
  for (const [clave, valor] of Object.entries(objeto)) {
    const normalizado = normalizarValor(valor)
    if (normalizado !== undefined) resultado[clave] = normalizado
  }
  return resultado
}

/**
 * En una modificación conserva solo los campos que cambiaron, para que el
 * registro muestre con claridad qué se modificó.
 */
export function calcularCambios(
  anterior: ObjetoJson,
  nuevo: ObjetoJson,
): { anterior: ObjetoJson; nuevo: ObjetoJson } {
  const cambiosAnterior: ObjetoJson = {}
  const cambiosNuevo: ObjetoJson = {}
  const claves = new Set([...Object.keys(anterior), ...Object.keys(nuevo)])
  for (const clave of claves) {
    const valorAnterior = anterior[clave] ?? null
    const valorNuevo = nuevo[clave] ?? null
    if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNuevo)) {
      cambiosAnterior[clave] = valorAnterior
      cambiosNuevo[clave] = valorNuevo
    }
  }
  return { anterior: cambiosAnterior, nuevo: cambiosNuevo }
}

export function construirRegistroAuditoria(datos: DatosAuditoria): RegistroAuditoria {
  if (!PATRON_ACCION.test(datos.accion)) {
    throw new Error(`Acción de auditoría inválida: "${datos.accion}"`)
  }
  if (datos.entidad.trim() === "") {
    throw new Error("La entidad de auditoría es obligatoria")
  }

  let valorAnterior = datos.valorAnterior ? normalizarObjeto(datos.valorAnterior) : null
  let valorNuevo = datos.valorNuevo ? normalizarObjeto(datos.valorNuevo) : null

  if (valorAnterior && valorNuevo) {
    const cambios = calcularCambios(valorAnterior, valorNuevo)
    valorAnterior = cambios.anterior
    valorNuevo = cambios.nuevo
  }

  return {
    negocioId: datos.negocioId,
    usuarioId: datos.usuarioId,
    accion: datos.accion,
    entidad: datos.entidad,
    entidadId: datos.entidadId,
    valorAnterior,
    valorNuevo,
  }
}
