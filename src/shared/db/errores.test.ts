import { describe, expect, it } from "vitest"
import { describirErrorDb, esViolacionUnica } from "./errores"

const violacionCi = { code: "23505", constraint_name: "clientes_negocio_ci_unico" }

describe("esViolacionUnica", () => {
  it("detecta la restricción en el error del driver", () => {
    expect(esViolacionUnica(violacionCi, "clientes_negocio_ci_unico")).toBe(true)
  })

  it("detecta la restricción dentro del error de Drizzle", () => {
    const envuelto = Object.assign(new Error("Failed query: insert ... params: Juan"), { cause: violacionCi })
    expect(esViolacionUnica(envuelto, "clientes_negocio_ci_unico")).toBe(true)
  })

  it("no confunde otra restricción ni otro código", () => {
    expect(esViolacionUnica(violacionCi, "otra_restriccion")).toBe(false)
    expect(esViolacionUnica({ code: "23503", constraint_name: "clientes_negocio_ci_unico" }, "clientes_negocio_ci_unico")).toBe(
      false,
    )
    expect(esViolacionUnica(new Error("x"), "clientes_negocio_ci_unico")).toBe(false)
    expect(esViolacionUnica(null, "clientes_negocio_ci_unico")).toBe(false)
  })
})

describe("describirErrorDb", () => {
  it("solo expone el código de Postgres, nunca la consulta ni sus parámetros", () => {
    const envuelto = Object.assign(new Error("Failed query: insert ... params: Juan,1234567"), { cause: violacionCi })
    expect(describirErrorDb(envuelto)).toBe("Postgres 23505")
  })

  it("sin código, usa el nombre del error", () => {
    expect(describirErrorDb(new TypeError("detalle con datos"))).toBe("TypeError")
    expect(describirErrorDb("texto")).toBe("error desconocido")
  })
})
