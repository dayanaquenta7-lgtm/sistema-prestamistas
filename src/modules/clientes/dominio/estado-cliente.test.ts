import { describe, expect, it } from "vitest"
import { derivarEstadoCliente, type EstadoPrestamo } from "./estado-cliente"

describe("derivarEstadoCliente", () => {
  it("sin préstamos", () => {
    expect(derivarEstadoCliente([])).toBe("sin-prestamos")
  })

  it.each<[EstadoPrestamo[]]>([[["cancelado"]], [["anulado"]], [["refinanciado", "cancelado", "anulado"]]])(
    "trata %j como sin préstamos activos",
    (estados) => {
      expect(derivarEstadoCliente(estados)).toBe("sin-prestamos")
    },
  )

  it("al día con un préstamo vigente", () => {
    expect(derivarEstadoCliente(["vigente"])).toBe("al-dia")
    expect(derivarEstadoCliente(["cancelado", "vigente", "anulado"])).toBe("al-dia")
  })

  it("en mora si algún préstamo está en mora, aunque otros estén vigentes", () => {
    expect(derivarEstadoCliente(["en-mora"])).toBe("en-mora")
    expect(derivarEstadoCliente(["vigente", "en-mora", "cancelado"])).toBe("en-mora")
  })
})
