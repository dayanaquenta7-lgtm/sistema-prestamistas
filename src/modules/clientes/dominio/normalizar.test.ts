import { describe, expect, it } from "vitest"
import { formatearTasa, normalizarCi, parsearTasa, tasasIguales, textoOpcional } from "./normalizar"

describe("textoOpcional", () => {
  it("recorta y devuelve null si queda vacío", () => {
    expect(textoOpcional("  Calle 1  ")).toBe("Calle 1")
    expect(textoOpcional("   ")).toBeNull()
    expect(textoOpcional(undefined)).toBeNull()
  })
})

describe("normalizarCi", () => {
  it("colapsa espacios y pasa a mayúsculas", () => {
    expect(normalizarCi("  1234567   lp ")).toBe("1234567 LP")
    expect(normalizarCi("1234567-1a")).toBe("1234567-1A")
  })

  it("devuelve null si está vacío", () => {
    expect(normalizarCi("")).toBeNull()
    expect(normalizarCi("  ")).toBeNull()
    expect(normalizarCi(null)).toBeNull()
  })
})

describe("parsearTasa", () => {
  it.each([
    ["2,5", "2.5000"],
    ["2.5", "2.5000"],
    ["3", "3.0000"],
    ["0", "0.0000"],
    ["100", "100.0000"],
    ["1,2345", "1.2345"],
    [" 4,5 % ", "4.5000"],
  ])("interpreta %j como %j", (texto, esperado) => {
    expect(parsearTasa(texto)).toBe(esperado)
  })

  it.each(["", "abc", "-1", "1,23456", "1.000,5", "1000", "2,"])("rechaza %j", (texto) => {
    expect(parsearTasa(texto)).toBeNull()
  })
})

describe("formatearTasa", () => {
  it("quita ceros sobrantes y usa coma decimal", () => {
    expect(formatearTasa("2.5000")).toBe("2,5")
    expect(formatearTasa("3.0000")).toBe("3")
    expect(formatearTasa("1.2345")).toBe("1,2345")
  })
})

describe("tasasIguales", () => {
  it("compara por valor", () => {
    expect(tasasIguales("2.5000", "2.5")).toBe(true)
    expect(tasasIguales("2.5000", "2.5001")).toBe(false)
    expect(tasasIguales(null, null)).toBe(true)
    expect(tasasIguales(null, "0.0000")).toBe(false)
  })
})
