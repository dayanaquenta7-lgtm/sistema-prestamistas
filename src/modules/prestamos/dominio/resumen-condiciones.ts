import { formatearTasa } from "@/shared/lib/tasas"
import type { CondicionesPlantilla, FrecuenciaPago, MetodoInteres, PeriodoTasa } from "./condiciones"

const PERIODO: Record<PeriodoTasa, string> = {
  diario: "diaria",
  semanal: "semanal",
  quincenal: "quincenal",
  mensual: "mensual",
  anual: "anual",
  total: "total",
}

const CUOTA: Record<Exclude<FrecuenciaPago, "pago_unico">, [string, string]> = {
  diaria: ["diaria", "diarias"],
  semanal: ["semanal", "semanales"],
  quincenal: ["quincenal", "quincenales"],
  mensual: ["mensual", "mensuales"],
}

const METODO: Record<MetodoInteres, string> = {
  flat: "Flat",
  saldo: "Sobre saldo",
  solo_interes: "Solo interés",
  monto_fijo: "Monto fijo",
}

/** Resumen de una línea para listados: "3 % mensual · 6 cuotas mensuales · Flat". */
export function resumirCondiciones(c: CondicionesPlantilla): string {
  const partes: string[] = []
  if (c.tasa) partes.push(`${formatearTasa(c.tasa.valor)} % ${PERIODO[c.tasa.periodo]}`)
  if (c.frecuencia === "pago_unico") {
    partes.push("Pago único")
  } else {
    const [singular, plural] = CUOTA[c.frecuencia]
    partes.push(c.numeroCuotas === 1 ? `1 cuota ${singular}` : `${c.numeroCuotas} cuotas ${plural}`)
  }
  partes.push(METODO[c.metodo])
  return partes.join(" · ")
}
