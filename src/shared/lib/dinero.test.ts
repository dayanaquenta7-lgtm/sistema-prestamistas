import { describe, expect, it } from "vitest"
import { Decimal as DecimalGlobal } from "decimal.js"
import {
  Decimal,
  aDecimal,
  formatearMonto,
  formatearNumero,
  parsearMonto,
  redondear2,
} from "./dinero"

describe("aDecimal", () => {
  it("convierte el texto de un numeric de la base de datos", () => {
    expect(aDecimal("1234.50").toString()).toBe("1234.5")
    expect(aDecimal("-0.01").toString()).toBe("-0.01")
  })

  it("acepta un Decimal existente", () => {
    expect(aDecimal(new Decimal("10.25")).toString()).toBe("10.25")
  })

  it("rechaza textos que no son numéricos", () => {
    expect(() => aDecimal("1,5")).toThrow()
    expect(() => aDecimal("abc")).toThrow()
    expect(() => aDecimal("")).toThrow()
  })

  it("evita los errores de coma flotante de number", () => {
    expect(aDecimal("0.1").plus(aDecimal("0.2")).toString()).toBe("0.3")
  })
})

describe("redondear2", () => {
  it("redondea a 2 decimales con ROUND_HALF_UP", () => {
    expect(redondear2(new Decimal("1.005")).toFixed(2)).toBe("1.01")
    expect(redondear2(new Decimal("1.004")).toFixed(2)).toBe("1.00")
    expect(redondear2(new Decimal("2.675")).toFixed(2)).toBe("2.68")
  })

  it("redondea los negativos alejándose de cero", () => {
    expect(redondear2(new Decimal("-1.005")).toFixed(2)).toBe("-1.01")
  })

  it("no altera la configuración global de decimal.js", () => {
    expect(DecimalGlobal.rounding).toBe(DecimalGlobal.ROUND_HALF_UP)
    expect(Decimal.rounding).toBe(DecimalGlobal.ROUND_HALF_UP)
    expect(Decimal).not.toBe(DecimalGlobal)
  })
})

describe("formatearMonto", () => {
  it("usa el formato boliviano Bs 1.234,56", () => {
    expect(formatearMonto("1234.56")).toBe("Bs 1.234,56")
  })

  it("completa siempre 2 decimales", () => {
    expect(formatearMonto("0")).toBe("Bs 0,00")
    expect(formatearMonto("5")).toBe("Bs 5,00")
    expect(formatearMonto("1000.5")).toBe("Bs 1.000,50")
  })

  it("agrupa millones", () => {
    expect(formatearMonto("1234567.89")).toBe("Bs 1.234.567,89")
  })

  it("redondea antes de formatear", () => {
    expect(formatearMonto("1004.615")).toBe("Bs 1.004,62")
  })

  it("muestra los negativos con el signo delante", () => {
    expect(formatearMonto("-250")).toBe("-Bs 250,00")
  })

  it("no muestra signo en un cero negativo tras redondear", () => {
    expect(formatearMonto("-0.001")).toBe("Bs 0,00")
  })

  it("acepta Decimal", () => {
    expect(formatearMonto(new Decimal("99.9"))).toBe("Bs 99,90")
  })
})

describe("formatearNumero", () => {
  it("formatea sin símbolo", () => {
    expect(formatearNumero("1234.5")).toBe("1.234,50")
  })
})

describe("parsearMonto", () => {
  it.each([
    ["1.234,56", "1234.56"],
    ["1234,56", "1234.56"],
    ["1234,5", "1234.5"],
    ["1234", "1234"],
    ["1.234", "1234"],
    ["1.234.567", "1234567"],
    ["12.5", "12.5"],
    ["0,50", "0.5"],
    ["Bs 1.000,00", "1000"],
    ["  250 ", "250"],
  ])("interpreta %s como %s", (texto, esperado) => {
    expect(parsearMonto(texto)?.toString()).toBe(esperado)
  })

  it.each(["", "abc", "-100", "1,234,56", "1.23.4", "12,345", "1.2345", "12.34.56,7"])(
    "rechaza %j",
    (texto) => {
      expect(parsearMonto(texto)).toBeNull()
    },
  )
})
