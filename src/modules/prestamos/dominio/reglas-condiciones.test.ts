import { describe, expect, it } from "vitest"
import { CONDICIONES_INICIALES, type CondicionesPlantilla } from "./condiciones"
import { MENSAJES_CONDICIONES as M, reglasCondiciones } from "./reglas-condiciones"

const base: CondicionesPlantilla = CONDICIONES_INICIALES

function errores(cambios: Partial<CondicionesPlantilla>) {
  return reglasCondiciones({ ...base, ...cambios })
}

describe("reglasCondiciones", () => {
  it("las condiciones iniciales son coherentes", () => {
    expect(reglasCondiciones(CONDICIONES_INICIALES)).toEqual([])
  })

  it("exige tasa salvo en monto fijo", () => {
    expect(errores({ tasa: null })).toEqual([{ campo: "tasaValor", mensaje: M.tasaObligatoria }])
    expect(errores({ metodo: "monto_fijo", tasa: null })).toEqual([])
  })

  it("en monto fijo la plantilla no guarda tasa", () => {
    expect(errores({ metodo: "monto_fijo" })).toEqual([{ campo: "tasaValor", mensaje: M.montoFijoSinTasa }])
  })

  it.each(["0.0000", "1000.0000"])("rechaza la tasa %s", (valor) => {
    expect(errores({ tasa: { valor, periodo: "mensual" } })).toEqual([
      { campo: "tasaValor", mensaje: M.tasaRango },
    ])
  })

  it("acepta una tasa total de 20 % con método flat", () => {
    expect(errores({ metodo: "flat", tasa: { valor: "20.0000", periodo: "total" } })).toEqual([])
  })

  it.each(["saldo", "solo_interes"] as const)("%s no admite tasa total", (metodo) => {
    expect(errores({ metodo, tasa: { valor: "20.0000", periodo: "total" } })).toEqual([
      { campo: "tasaPeriodo", mensaje: M.tasaTotalNoPermitida },
    ])
  })

  it("pago único exige una sola cuota", () => {
    expect(errores({ frecuencia: "pago_unico", numeroCuotas: 2 })).toEqual([
      { campo: "numeroCuotas", mensaje: M.pagoUnicoUnaCuota },
    ])
    expect(errores({ frecuencia: "pago_unico", numeroCuotas: 1 })).toEqual([])
  })

  it.each([0, 731, 2.5])("rechaza %d cuotas", (numeroCuotas) => {
    expect(errores({ numeroCuotas })).toEqual([{ campo: "numeroCuotas", mensaje: M.cuotasRango }])
  })

  it.each([1, 730])("acepta %d cuotas", (numeroCuotas) => {
    expect(errores({ numeroCuotas })).toEqual([])
  })

  describe("comisión", () => {
    it.each(["0.0000", "100.0000"])("en porcentaje rechaza %s", (valor) => {
      expect(errores({ comision: { tipo: "porcentaje", valor, modalidad: "descontada" } })).toEqual([
        { campo: "comisionValor", mensaje: M.comisionPorcentajeRango },
      ])
    })

    it("en porcentaje acepta 99,9999", () => {
      expect(errores({ comision: { tipo: "porcentaje", valor: "99.9999", modalidad: "financiada" } })).toEqual([])
    })

    it("en monto fijo exige un monto mayor a cero", () => {
      expect(errores({ comision: { tipo: "monto_fijo", valor: "0.00", modalidad: "descontada" } })).toEqual([
        { campo: "comisionValor", mensaje: M.comisionMontoPositivo },
      ])
      expect(errores({ comision: { tipo: "monto_fijo", valor: "20.00", modalidad: "descontada" } })).toEqual([])
    })
  })

  describe("mora", () => {
    it.each(["0.0000", "5.0001"])("en porcentaje diario rechaza %s", (valor) => {
      expect(errores({ mora: { tipo: "porcentaje_diario", valor, diasGracia: 0 } })).toEqual([
        { campo: "moraValor", mensaje: M.moraPorcentajeRango },
      ])
    })

    it("en porcentaje diario acepta hasta 5 %", () => {
      expect(errores({ mora: { tipo: "porcentaje_diario", valor: "5.0000", diasGracia: 3 } })).toEqual([])
    })

    it.each(["monto_diario", "monto_por_cuota"] as const)("%s exige un monto mayor a cero", (tipo) => {
      expect(errores({ mora: { tipo, valor: "0.00", diasGracia: 0 } })).toEqual([
        { campo: "moraValor", mensaje: M.moraMontoPositivo },
      ])
    })

    it.each([-1, 366, 1.5])("rechaza %d días de gracia", (diasGracia) => {
      expect(errores({ mora: { tipo: "monto_diario", valor: "5.00", diasGracia } })).toEqual([
        { campo: "moraDiasGracia", mensaje: M.diasGraciaRango },
      ])
    })
  })

  it("exige al menos un día de cobro", () => {
    expect(errores({ diasNoCobrables: [1, 2, 3, 4, 5, 6, 7] })).toEqual([
      { campo: "diasNoCobrables", mensaje: M.algunDiaCobrable },
    ])
  })

  it("rechaza días repetidos o fuera de 1 a 7", () => {
    expect(errores({ diasNoCobrables: [7, 7] })).toEqual([{ campo: "diasNoCobrables", mensaje: M.diasInvalidos }])
    expect(errores({ diasNoCobrables: [0] })).toEqual([{ campo: "diasNoCobrables", mensaje: M.diasInvalidos }])
  })

  it("informa varios errores a la vez", () => {
    expect(errores({ tasa: null, frecuencia: "pago_unico", numeroCuotas: 3 }).map((e) => e.campo)).toEqual([
      "tasaValor",
      "numeroCuotas",
    ])
  })
})
