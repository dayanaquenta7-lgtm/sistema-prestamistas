import { describe, expect, it } from "vitest"
import { ESTADOS } from "./estados"

describe("ESTADOS", () => {
  it("usa los colores definidos en CLAUDE.md", () => {
    expect(ESTADOS.vigente.tono).toBe("vigente")
    expect(ESTADOS["al-dia"].tono).toBe("vigente")
    expect(ESTADOS["por-vencer"].tono).toBe("por-vencer")
    expect(ESTADOS["en-mora"].tono).toBe("mora")
    expect(ESTADOS.vencida.tono).toBe("mora")
    expect(ESTADOS.cancelado.tono).toBe("cancelado")
    expect(ESTADOS.pagada.tono).toBe("cancelado")
    expect(ESTADOS.refinanciado.tono).toBe("refinanciado")
    expect(ESTADOS.anulado.tono).toBe("anulado")
  })

  it("todos los estados tienen etiqueta de texto (el color nunca va solo)", () => {
    for (const { etiqueta } of Object.values(ESTADOS)) {
      expect(etiqueta.trim().length).toBeGreaterThan(0)
    }
  })
})
