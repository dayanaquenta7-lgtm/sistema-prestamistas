import { describe, expect, it } from "vitest"
import { esquemaMonto, esquemaMontoPositivo } from "./esquemas"

describe("esquemaMonto", () => {
  it("transforma el formato boliviano al texto canónico", () => {
    expect(esquemaMonto.parse("1.234,5")).toBe("1234.50")
    expect(esquemaMonto.parse("Bs 300")).toBe("300.00")
  })

  it("rechaza montos vacíos o inválidos con mensaje claro", () => {
    const vacio = esquemaMonto.safeParse("  ")
    expect(vacio.success).toBe(false)
    expect(vacio.error?.issues[0]?.message).toBe("Ingresa un monto")

    const invalido = esquemaMonto.safeParse("12,345")
    expect(invalido.success).toBe(false)
    expect(invalido.error?.issues[0]?.message).toContain("Monto inválido")
  })
})

describe("esquemaMontoPositivo", () => {
  it("rechaza cero", () => {
    expect(esquemaMontoPositivo.safeParse("0,00").success).toBe(false)
    expect(esquemaMontoPositivo.safeParse("0,01").success).toBe(true)
  })
})
