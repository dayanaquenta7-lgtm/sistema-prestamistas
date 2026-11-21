import { aDecimal } from "@/shared/lib/dinero"
import { DIAS_SEMANA, type CondicionesPlantilla } from "./condiciones"

export const MENSAJES_CONDICIONES = {
  tasaObligatoria: "Ingresa la tasa de interés.",
  tasaFormato: "Tasa inválida. Usa hasta 4 decimales, por ejemplo 2,5.",
  tasaRango: "La tasa debe ser mayor a 0 y menor a 1.000 %.",
  montoFijoSinTasa: "Con monto fijo, el monto a devolver se indica al crear cada préstamo; la plantilla no lleva tasa.",
  tasaTotalNoPermitida:
    "Este método necesita una tasa por período (diaria, semanal, quincenal, mensual o anual), no una tasa total.",
  cuotasRango: "El número de cuotas debe ser un número entero entre 1 y 730.",
  pagoUnicoUnaCuota: "Con pago único, el número de cuotas debe ser 1.",
  valorObligatorio: "Ingresa un valor.",
  montoFormato: "Monto inválido. Ejemplo: 1.234,50.",
  comisionPorcentajeRango: "La comisión debe ser mayor a 0 y menor a 100 %.",
  comisionMontoPositivo: "La comisión debe ser mayor a cero. Si no cobras comisión, elige «Ninguna».",
  moraPorcentajeRango: "La mora diaria debe ser mayor a 0 y de hasta 5 % del capital vencido.",
  moraMontoPositivo: "La mora debe ser mayor a cero. Si no cobras mora, elige «Ninguna».",
  diasGraciaRango: "Los días de gracia deben ser un número entero entre 0 y 365.",
  algunDiaCobrable: "Debe quedar al menos un día de cobro en la semana.",
  diasInvalidos: "Revisa los días no cobrables.",
} as const

/** Campos del formulario de condiciones a los que se asocia cada error. */
export type CampoCondiciones =
  | "tasaValor"
  | "tasaPeriodo"
  | "numeroCuotas"
  | "comisionValor"
  | "moraValor"
  | "moraDiasGracia"
  | "diasNoCobrables"

export interface ErrorCondiciones {
  campo: CampoCondiciones
  mensaje: string
}

const M = MENSAJES_CONDICIONES
export const MAX_CUOTAS = 730
export const MAX_DIAS_GRACIA = 365
/** Tope de la mora en % diario: 5 % por día ya equivale a 150 % al mes. */
export const MAX_MORA_PORCENTAJE_DIARIO = "5"
const MAX_TASA_EXCLUSIVO = "1000"

const esEnteroEntre = (valor: number, min: number, max: number) =>
  Number.isInteger(valor) && valor >= min && valor <= max

/**
 * Reglas de valores y de coherencia entre parámetros. Se aplican igual al
 * formulario y a lo que se lee de la base. Devuelve todos los errores.
 */
export function reglasCondiciones(c: CondicionesPlantilla): ErrorCondiciones[] {
  const errores: ErrorCondiciones[] = []
  const agregar = (campo: CampoCondiciones, mensaje: string) => errores.push({ campo, mensaje })

  if (c.metodo === "monto_fijo") {
    if (c.tasa !== null) agregar("tasaValor", M.montoFijoSinTasa)
  } else if (c.tasa === null) {
    agregar("tasaValor", M.tasaObligatoria)
  } else {
    const tasa = aDecimal(c.tasa.valor)
    if (tasa.lessThanOrEqualTo(0) || tasa.greaterThanOrEqualTo(MAX_TASA_EXCLUSIVO)) agregar("tasaValor", M.tasaRango)
    // El sistema francés y el de solo interés cobran interés por período.
    if (c.tasa.periodo === "total" && (c.metodo === "saldo" || c.metodo === "solo_interes")) {
      agregar("tasaPeriodo", M.tasaTotalNoPermitida)
    }
  }

  if (!esEnteroEntre(c.numeroCuotas, 1, MAX_CUOTAS)) {
    agregar("numeroCuotas", M.cuotasRango)
  } else if (c.frecuencia === "pago_unico" && c.numeroCuotas !== 1) {
    agregar("numeroCuotas", M.pagoUnicoUnaCuota)
  }

  if (c.comision.tipo === "porcentaje") {
    const valor = aDecimal(c.comision.valor)
    if (valor.lessThanOrEqualTo(0) || valor.greaterThanOrEqualTo(100)) agregar("comisionValor", M.comisionPorcentajeRango)
  } else if (c.comision.tipo === "monto_fijo" && aDecimal(c.comision.valor).lessThanOrEqualTo(0)) {
    agregar("comisionValor", M.comisionMontoPositivo)
  }

  if (c.mora.tipo !== "ninguna") {
    const valor = aDecimal(c.mora.valor)
    if (c.mora.tipo === "porcentaje_diario") {
      if (valor.lessThanOrEqualTo(0) || valor.greaterThan(MAX_MORA_PORCENTAJE_DIARIO)) {
        agregar("moraValor", M.moraPorcentajeRango)
      }
    } else if (valor.lessThanOrEqualTo(0)) {
      agregar("moraValor", M.moraMontoPositivo)
    }
    if (!esEnteroEntre(c.mora.diasGracia, 0, MAX_DIAS_GRACIA)) agregar("moraDiasGracia", M.diasGraciaRango)
  }

  const dias = c.diasNoCobrables
  const diasValidos =
    new Set(dias).size === dias.length && dias.every((dia) => (DIAS_SEMANA as readonly number[]).includes(dia))
  if (!diasValidos) {
    agregar("diasNoCobrables", M.diasInvalidos)
  } else if (dias.length === DIAS_SEMANA.length) {
    agregar("diasNoCobrables", M.algunDiaCobrable)
  }

  return errores
}
