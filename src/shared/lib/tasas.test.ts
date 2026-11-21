import { describe, expect, it } from "vitest"
import { formatearTasa, parsearTasa, tasasIguales } from "./tasas"

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
