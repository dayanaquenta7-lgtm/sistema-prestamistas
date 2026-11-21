import { describe, expect, it } from "vitest"
import { CONDICIONES_INICIALES } from "../dominio/condiciones"
import { MENSAJES_CONDICIONES as M } from "../dominio/reglas-condiciones"
import {
  aEntradaFormulario,
  esquemaCondicionesPlantilla,
  esquemaFormularioCondiciones,
  leerCondiciones,
  type EntradaFormularioCondiciones,
} from "./condiciones"

const entrada: EntradaFormularioCondiciones = aEntradaFormulario(CONDICIONES_INICIALES)

function errores(cambios: Partial<EntradaFormularioCondiciones>) {
  const resultado = esquemaFormularioCondiciones.safeParse({ ...entrada, ...cambios })
  return resultado.success ? [] : resultado.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
}

describe("esquemaFormularioCondiciones", () => {
  it("convierte la entrada del formulario al formato canónico", () => {
    const datos = esquemaFormularioCondiciones.parse({
      ...entrada,
      metodo: "flat",
      tasaValor: "20",
      tasaPeriodo: "total",
      frecuencia: "diaria",
      numeroCuotas: " 24 ",
      comisionTipo: "monto_fijo",
      comisionValor: "1.000,5",
      comisionModalidad: "descontada",
      moraTipo: "porcentaje_diario",
      moraValor: "0,5",
      moraDiasGracia: "2",
      diasNoCobrables: [7, 6],
      omitirFeriados: false,
      redondeo: "cincuenta_centavos",
    })
    expect(datos).toEqual({
      version: 1,
      metodo: "flat",
      tasa: { valor: "20.0000", periodo: "total" },
      frecuencia: "diaria",
      numeroCuotas: 24,
      comision: { tipo: "monto_fijo", valor: "1000.50", modalidad: "descontada" },
      mora: { tipo: "porcentaje_diario", valor: "0.5000", diasGracia: 2 },
      diasNoCobrables: [6, 7],
      omitirFeriados: false,
      redondeo: "cincuenta_centavos",
    })
  })

  it("ignora los campos que no aplican: tasa en monto fijo, valores con 'Ninguna'", () => {
    const datos = esquemaFormularioCondiciones.parse({
      ...entrada,
      metodo: "monto_fijo",
      tasaValor: "basura",
      comisionTipo: "ninguna",
      comisionValor: "basura",
      moraTipo: "ninguna",
      moraValor: "basura",
      moraDiasGracia: "basura",
    })
    expect(datos.tasa).toBeNull()
    expect(datos.comision).toEqual({ tipo: "ninguna" })
    expect(datos.mora).toEqual({ tipo: "ninguna" })
  })

  it("informa errores de formato por campo", () => {
    expect(errores({ tasaValor: "" })).toEqual([`tasaValor: ${M.tasaObligatoria}`])
    expect(errores({ tasaValor: "2,12345" })).toEqual([`tasaValor: ${M.tasaFormato}`])
    expect(errores({ numeroCuotas: "seis" })).toEqual([`numeroCuotas: ${M.cuotasRango}`])
    expect(errores({ comisionTipo: "monto_fijo", comisionValor: "abc" })).toEqual([`comisionValor: ${M.montoFormato}`])
    expect(errores({ comisionTipo: "porcentaje", comisionValor: "" })).toEqual([`comisionValor: ${M.valorObligatorio}`])
    expect(errores({ moraTipo: "monto_diario", moraValor: "5", moraDiasGracia: "-1" })).toEqual([
      `moraDiasGracia: ${M.diasGraciaRango}`,
    ])
  })

  it("aplica las reglas de coherencia con la ruta del campo del formulario", () => {
    expect(errores({ frecuencia: "pago_unico", numeroCuotas: "3" })).toEqual([`numeroCuotas: ${M.pagoUnicoUnaCuota}`])
    expect(errores({ metodo: "saldo", tasaPeriodo: "total" })).toEqual([`tasaPeriodo: ${M.tasaTotalNoPermitida}`])
    expect(errores({ moraTipo: "porcentaje_diario", moraValor: "6", moraDiasGracia: "0" })).toEqual([
      `moraValor: ${M.moraPorcentajeRango}`,
    ])
  })

  it("rechaza opciones fuera de la lista", () => {
    expect(errores({ metodo: "aleman" as never })[0]).toMatch(/^metodo: /)
  })
})

describe("aEntradaFormulario", () => {
  it("es inversa del esquema del formulario", () => {
    const condiciones = esquemaFormularioCondiciones.parse({
      ...entrada,
      comisionTipo: "porcentaje",
      comisionValor: "2,5",
      comisionModalidad: "financiada",
      moraTipo: "monto_por_cuota",
      moraValor: "1.500",
      moraDiasGracia: "1",
    })
    expect(esquemaFormularioCondiciones.parse(aEntradaFormulario(condiciones))).toEqual(condiciones)
  })

  it("muestra tasas y montos en formato boliviano", () => {
    const e = aEntradaFormulario({
      ...CONDICIONES_INICIALES,
      tasa: { valor: "2.5000", periodo: "mensual" },
      comision: { tipo: "monto_fijo", valor: "1500.00", modalidad: "descontada" },
    })
    expect(e.tasaValor).toBe("2,5")
    expect(e.comisionValor).toBe("1.500,00")
  })
})

describe("esquemaCondicionesPlantilla (formato guardado)", () => {
  it("acepta las condiciones iniciales", () => {
    expect(esquemaCondicionesPlantilla.parse(CONDICIONES_INICIALES)).toEqual(CONDICIONES_INICIALES)
  })

  it("rechaza números en lugar de texto decimal", () => {
    const resultado = esquemaCondicionesPlantilla.safeParse({
      ...CONDICIONES_INICIALES,
      tasa: { valor: 3, periodo: "mensual" },
    })
    expect(resultado.success).toBe(false)
  })

  it("rechaza otra versión o campos desconocidos", () => {
    expect(esquemaCondicionesPlantilla.safeParse({ ...CONDICIONES_INICIALES, version: 2 }).success).toBe(false)
    expect(esquemaCondicionesPlantilla.safeParse({ ...CONDICIONES_INICIALES, extra: 1 }).success).toBe(false)
  })

  it("aplica las reglas con la ruta anidada", () => {
    const resultado = esquemaCondicionesPlantilla.safeParse({
      ...CONDICIONES_INICIALES,
      frecuencia: "pago_unico",
      numeroCuotas: 4,
    })
    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues.map((i) => i.path.join("."))).toEqual(["numeroCuotas"])
  })
})

describe("leerCondiciones", () => {
  it("devuelve null si lo guardado no es válido", () => {
    expect(leerCondiciones(null)).toBeNull()
    expect(leerCondiciones({ version: 1 })).toBeNull()
    expect(leerCondiciones(CONDICIONES_INICIALES)).toEqual(CONDICIONES_INICIALES)
  })
})
