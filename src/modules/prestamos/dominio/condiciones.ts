/**
 * Condiciones de préstamo (docs/alcance.md, sección 3). Mismo formato en las
 * condiciones por defecto del negocio y en las plantillas. Tasas y montos van
 * como texto decimal canónico ("3.0000", "50.00"), nunca como number.
 *
 * Este es el nivel "plantilla": con método monto_fijo no guarda ningún valor,
 * porque el monto a devolver depende de cada préstamo. El nivel "snapshot"
 * (RN-01), que exige el interés fijo en Bs, se define en el Sprint 2.
 */

export const METODOS_INTERES = ["flat", "saldo", "solo_interes", "monto_fijo"] as const
export const PERIODOS_TASA = ["diario", "semanal", "quincenal", "mensual", "anual", "total"] as const
export const FRECUENCIAS_PAGO = ["diaria", "semanal", "quincenal", "mensual", "pago_unico"] as const
export const TIPOS_COMISION = ["ninguna", "porcentaje", "monto_fijo"] as const
export const MODALIDADES_COMISION = ["descontada", "financiada"] as const
export const TIPOS_MORA = ["ninguna", "porcentaje_diario", "monto_diario", "monto_por_cuota"] as const
export const REDONDEOS_CUOTA = ["centavo", "cincuenta_centavos", "boliviano"] as const
/** Días de la semana ISO: 1 = lunes … 7 = domingo. */
export const DIAS_SEMANA = [1, 2, 3, 4, 5, 6, 7] as const

export type MetodoInteres = (typeof METODOS_INTERES)[number]
export type PeriodoTasa = (typeof PERIODOS_TASA)[number]
export type FrecuenciaPago = (typeof FRECUENCIAS_PAGO)[number]
export type TipoComision = (typeof TIPOS_COMISION)[number]
export type ModalidadComision = (typeof MODALIDADES_COMISION)[number]
export type TipoMora = (typeof TIPOS_MORA)[number]
export type RedondeoCuota = (typeof REDONDEOS_CUOTA)[number]

export const VERSION_CONDICIONES = 1

export type Comision =
  | { tipo: "ninguna" }
  | { tipo: "porcentaje" | "monto_fijo"; valor: string; modalidad: ModalidadComision }

export type Mora =
  | { tipo: "ninguna" }
  | { tipo: "porcentaje_diario" | "monto_diario" | "monto_por_cuota"; valor: string; diasGracia: number }

// Alias de tipo (no interface) para que sea asignable a JSON en auditoría y jsonb.
export type CondicionesPlantilla = {
  version: typeof VERSION_CONDICIONES
  metodo: MetodoInteres
  /** Null solo con método monto_fijo. */
  tasa: { valor: string; periodo: PeriodoTasa } | null
  frecuencia: FrecuenciaPago
  numeroCuotas: number
  comision: Comision
  mora: Mora
  diasNoCobrables: number[]
  omitirFeriados: boolean
  redondeo: RedondeoCuota
}

/** Valores que propone el formulario mientras el negocio no guarde los suyos. */
export const CONDICIONES_INICIALES: CondicionesPlantilla = {
  version: VERSION_CONDICIONES,
  metodo: "flat",
  tasa: { valor: "3.0000", periodo: "mensual" },
  frecuencia: "mensual",
  numeroCuotas: 6,
  comision: { tipo: "ninguna" },
  mora: { tipo: "ninguna" },
  diasNoCobrables: [7],
  omitirFeriados: true,
  redondeo: "centavo",
}

export const ETIQUETAS_METODO: Record<MetodoInteres, string> = {
  flat: "Flat (sobre el capital inicial)",
  saldo: "Sobre saldo (cuota fija)",
  solo_interes: "Solo interés (capital al final)",
  monto_fijo: "Monto fijo a devolver",
}

export const ETIQUETAS_PERIODO: Record<PeriodoTasa, string> = {
  diario: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  anual: "Anual",
  total: "Total del préstamo",
}

export const ETIQUETAS_FRECUENCIA: Record<FrecuenciaPago, string> = {
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  pago_unico: "Pago único",
}

export const ETIQUETAS_COMISION: Record<TipoComision, string> = {
  ninguna: "Ninguna",
  porcentaje: "Porcentaje del monto",
  monto_fijo: "Monto fijo",
}

export const ETIQUETAS_MODALIDAD: Record<ModalidadComision, string> = {
  descontada: "Descontada del desembolso",
  financiada: "Financiada en las cuotas",
}

export const ETIQUETAS_MORA: Record<TipoMora, string> = {
  ninguna: "Ninguna",
  porcentaje_diario: "% diario sobre capital vencido",
  monto_diario: "Monto por día de atraso",
  monto_por_cuota: "Monto por cuota vencida",
}

export const ETIQUETAS_REDONDEO: Record<RedondeoCuota, string> = {
  centavo: "Al centavo",
  cincuenta_centavos: "A 0,50",
  boliviano: "Al boliviano entero",
}

export const ETIQUETAS_DIA: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
}
