import { describe, expect, it } from "vitest"
import { normalizarCi, textoOpcional } from "./normalizar"

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
