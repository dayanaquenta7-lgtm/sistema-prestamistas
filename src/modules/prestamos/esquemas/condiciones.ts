import { z } from "zod"
import { formatearNumero, parsearMonto } from "@/shared/lib/dinero"
import { formatearTasa, parsearTasa } from "@/shared/lib/tasas"
import {
  FRECUENCIAS_PAGO,
  METODOS_INTERES,
  MODALIDADES_COMISION,
  PERIODOS_TASA,
  REDONDEOS_CUOTA,
  TIPOS_COMISION,
  TIPOS_MORA,
  VERSION_CONDICIONES,
  type Comision,
  type CondicionesPlantilla,
  type Mora,
} from "../dominio/condiciones"
import { MENSAJES_CONDICIONES as M, reglasCondiciones, type CampoCondiciones } from "../dominio/reglas-condiciones"

// ─── Formato guardado (jsonb) ──────────────────────────────────────────────

const tasaCanonica = z.string().regex(/^\d+\.\d{4}$/)
const montoCanonico = z.string().regex(/^\d+\.\d{2}$/)

/** Ruta en el objeto guardado de cada campo del formulario. */
const RUTA_GUARDADA: Record<CampoCondiciones, string[]> = {
  tasaValor: ["tasa", "valor"],
  tasaPeriodo: ["tasa", "periodo"],
  numeroCuotas: ["numeroCuotas"],
  comisionValor: ["comision", "valor"],
  moraValor: ["mora", "valor"],
  moraDiasGracia: ["mora", "diasGracia"],
  diasNoCobrables: ["diasNoCobrables"],
}

const comisionGuardada = z.discriminatedUnion("tipo", [
  z.strictObject({ tipo: z.literal("ninguna") }),
  z.strictObject({ tipo: z.literal("porcentaje"), valor: tasaCanonica, modalidad: z.enum(MODALIDADES_COMISION) }),
  z.strictObject({ tipo: z.literal("monto_fijo"), valor: montoCanonico, modalidad: z.enum(MODALIDADES_COMISION) }),
])

const moraGuardada = z.discriminatedUnion("tipo", [
  z.strictObject({ tipo: z.literal("ninguna") }),
  z.strictObject({ tipo: z.literal("porcentaje_diario"), valor: tasaCanonica, diasGracia: z.number() }),
  z.strictObject({ tipo: z.literal("monto_diario"), valor: montoCanonico, diasGracia: z.number() }),
  z.strictObject({ tipo: z.literal("monto_por_cuota"), valor: montoCanonico, diasGracia: z.number() }),
])

/**
 * Esquema de las condiciones tal como se guardan (condiciones por defecto del
 * negocio y plantillas). Se valida al escribir y al leer de la base.
 */
export const esquemaCondicionesPlantilla = z
  .strictObject({
    version: z.literal(VERSION_CONDICIONES),
    metodo: z.enum(METODOS_INTERES),
    tasa: z.strictObject({ valor: tasaCanonica, periodo: z.enum(PERIODOS_TASA) }).nullable(),
    frecuencia: z.enum(FRECUENCIAS_PAGO),
    numeroCuotas: z.number(),
    comision: comisionGuardada,
    mora: moraGuardada,
    diasNoCobrables: z.array(z.number()),
    omitirFeriados: z.boolean(),
    redondeo: z.enum(REDONDEOS_CUOTA),
  })
  .superRefine((condiciones, contexto) => {
    for (const error of reglasCondiciones(condiciones)) {
      contexto.addIssue({ code: "custom", path: RUTA_GUARDADA[error.campo], message: error.mensaje })
    }
  }) satisfies z.ZodType<CondicionesPlantilla>

/** Condiciones leídas de la base, o null si no son válidas (nunca se usan a medias). */
export function leerCondiciones(valor: unknown): CondicionesPlantilla | null {
  const resultado = esquemaCondicionesPlantilla.safeParse(valor)
  return resultado.success ? resultado.data : null
}

// ─── Formulario ────────────────────────────────────────────────────────────

/**
 * Entrada plana del formulario (todo texto, como lo escribe el usuario). Se
 * transforma al formato guardado y se le aplican las mismas reglas, con los
 * errores asociados a cada campo del formulario. Mismo esquema en el cliente y
 * en el servidor.
 */
export const esquemaFormularioCondiciones = z
  .object({
    metodo: z.enum(METODOS_INTERES, "Elige un método de interés."),
    tasaValor: z.string(),
    tasaPeriodo: z.enum(PERIODOS_TASA, "Elige el período de la tasa."),
    frecuencia: z.enum(FRECUENCIAS_PAGO, "Elige la frecuencia de pago."),
    numeroCuotas: z.string(),
    comisionTipo: z.enum(TIPOS_COMISION, "Elige el tipo de comisión."),
    comisionValor: z.string(),
    comisionModalidad: z.enum(MODALIDADES_COMISION, "Elige cómo se cobra la comisión."),
    moraTipo: z.enum(TIPOS_MORA, "Elige el tipo de mora."),
    moraValor: z.string(),
    moraDiasGracia: z.string(),
    diasNoCobrables: z.array(z.number()),
    omitirFeriados: z.boolean(),
    redondeo: z.enum(REDONDEOS_CUOTA, "Elige el redondeo."),
  })
  .transform((e, contexto): CondicionesPlantilla => {
    let conErrores = false
    const error = (campo: CampoCondiciones, mensaje: string) => {
      conErrores = true
      contexto.addIssue({ code: "custom", path: [campo], message: mensaje })
    }

    const leerTasa = (campo: CampoCondiciones, texto: string, vacio: string): string => {
      if (texto.trim() === "") error(campo, vacio)
      else if (parsearTasa(texto) === null) error(campo, M.tasaFormato)
      return parsearTasa(texto) ?? "0.0000"
    }
    const leerMonto = (campo: CampoCondiciones, texto: string): string => {
      const monto = parsearMonto(texto)
      if (texto.trim() === "") error(campo, M.valorObligatorio)
      else if (!monto) error(campo, M.montoFormato)
      return monto?.toFixed(2) ?? "0.00"
    }
    const leerEntero = (campo: CampoCondiciones, texto: string, mensaje: string): number => {
      const limpio = texto.trim()
      if (!/^\d{1,4}$/.test(limpio)) {
        error(campo, mensaje)
        return 0
      }
      return Number.parseInt(limpio, 10)
    }

    const tasa =
      e.metodo === "monto_fijo"
        ? null
        : { valor: leerTasa("tasaValor", e.tasaValor, M.tasaObligatoria), periodo: e.tasaPeriodo }

    const numeroCuotas = leerEntero("numeroCuotas", e.numeroCuotas, M.cuotasRango)

    let comision: Comision
    if (e.comisionTipo === "ninguna") comision = { tipo: "ninguna" }
    else if (e.comisionTipo === "porcentaje")
      comision = {
        tipo: "porcentaje",
        valor: leerTasa("comisionValor", e.comisionValor, M.valorObligatorio),
        modalidad: e.comisionModalidad,
      }
    else comision = { tipo: "monto_fijo", valor: leerMonto("comisionValor", e.comisionValor), modalidad: e.comisionModalidad }

    let mora: Mora
    if (e.moraTipo === "ninguna") {
      mora = { tipo: "ninguna" }
    } else {
      const valor =
        e.moraTipo === "porcentaje_diario"
          ? leerTasa("moraValor", e.moraValor, M.valorObligatorio)
          : leerMonto("moraValor", e.moraValor)
      mora = { tipo: e.moraTipo, valor, diasGracia: leerEntero("moraDiasGracia", e.moraDiasGracia, M.diasGraciaRango) }
    }

    const condiciones: CondicionesPlantilla = {
      version: VERSION_CONDICIONES,
      metodo: e.metodo,
      tasa,
      frecuencia: e.frecuencia,
      numeroCuotas,
      comision,
      mora,
      diasNoCobrables: [...e.diasNoCobrables].sort((a, b) => a - b),
      omitirFeriados: e.omitirFeriados,
      redondeo: e.redondeo,
    }

    // Las reglas solo se evalúan con todos los formatos correctos, para no repetir errores.
    if (conErrores) return z.NEVER
    for (const regla of reglasCondiciones(condiciones)) error(regla.campo, regla.mensaje)
    return conErrores ? z.NEVER : condiciones
  })

export type EntradaFormularioCondiciones = z.input<typeof esquemaFormularioCondiciones>

/** Convierte condiciones guardadas en los valores iniciales del formulario. */
export function aEntradaFormulario(c: CondicionesPlantilla): EntradaFormularioCondiciones {
  const valorComision =
    c.comision.tipo === "porcentaje"
      ? formatearTasa(c.comision.valor)
      : c.comision.tipo === "monto_fijo"
        ? formatearNumero(c.comision.valor)
        : ""
  const valorMora =
    c.mora.tipo === "porcentaje_diario"
      ? formatearTasa(c.mora.valor)
      : c.mora.tipo === "ninguna"
        ? ""
        : formatearNumero(c.mora.valor)
  return {
    metodo: c.metodo,
    tasaValor: c.tasa ? formatearTasa(c.tasa.valor) : "",
    tasaPeriodo: c.tasa?.periodo ?? "mensual",
    frecuencia: c.frecuencia,
    numeroCuotas: String(c.numeroCuotas),
    comisionTipo: c.comision.tipo,
    comisionValor: valorComision,
    comisionModalidad: c.comision.tipo === "ninguna" ? "descontada" : c.comision.modalidad,
    moraTipo: c.mora.tipo,
    moraValor: valorMora,
    moraDiasGracia: c.mora.tipo === "ninguna" ? "0" : String(c.mora.diasGracia),
    diasNoCobrables: [...c.diasNoCobrables],
    omitirFeriados: c.omitirFeriados,
    redondeo: c.redondeo,
  }
}
