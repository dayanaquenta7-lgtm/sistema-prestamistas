import { describe, expect, it } from "vitest"
import { elegirMembresia } from "./seleccion-negocio"

// Ordenadas de la más antigua a la más nueva, como las entrega la consulta.
const membresias = [
  { negocio: { id: "negocio-a" }, rol: "dueno" as const },
  { negocio: { id: "negocio-b" }, rol: "ayudante" as const },
]

describe("elegirMembresia", () => {
  it("usa el negocio de la cookie si el usuario tiene una membresía activa en él", () => {
    expect(elegirMembresia(membresias, "negocio-b")).toBe(membresias[1])
  })

  it("sin cookie usa la membresía más antigua", () => {
    expect(elegirMembresia(membresias, undefined)).toBe(membresias[0])
  })

  it("con una cookie que no coincide (negocio ajeno o membresía desactivada) usa la más antigua", () => {
    expect(elegirMembresia(membresias, "negocio-ajeno")).toBe(membresias[0])
    expect(elegirMembresia([membresias[0]], "negocio-b")).toBe(membresias[0])
  })

  it("sin membresías activas devuelve null", () => {
    expect(elegirMembresia([], "negocio-a")).toBeNull()
  })
})
