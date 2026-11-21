import { describe, expect, it } from "vitest"
import { CONDICIONES_INICIALES, type CondicionesPlantilla } from "./condiciones"
import { resumirCondiciones } from "./resumen-condiciones"

const c = (cambios: Partial<CondicionesPlantilla>): CondicionesPlantilla => ({ ...CONDICIONES_INICIALES, ...cambios })

describe("resumirCondiciones", () => {
  it("resume tasa, cuotas y método", () => {
    expect(resumirCondiciones(CONDICIONES_INICIALES)).toBe("3 % mensual · 6 cuotas mensuales · Flat")
  })

  it("usa singular con una cuota y nombra el pago único", () => {
    expect(resumirCondiciones(c({ numeroCuotas: 1 }))).toBe("3 % mensual · 1 cuota mensual · Flat")
    expect(resumirCondiciones(c({ frecuencia: "pago_unico", numeroCuotas: 1 }))).toBe("3 % mensual · Pago único · Flat")
  })

  it("describe tasa total, saldo y monto fijo", () => {
    expect(
      resumirCondiciones(c({ tasa: { valor: "20.0000", periodo: "total" }, frecuencia: "diaria", numeroCuotas: 24 })),
    ).toBe("20 % total · 24 cuotas diarias · Flat")
    expect(resumirCondiciones(c({ metodo: "saldo", tasa: { valor: "2.5000", periodo: "anual" } }))).toBe(
      "2,5 % anual · 6 cuotas mensuales · Sobre saldo",
    )
    expect(resumirCondiciones(c({ metodo: "monto_fijo", tasa: null, frecuencia: "semanal", numeroCuotas: 4 }))).toBe(
      "4 cuotas semanales · Monto fijo",
    )
  })
})
