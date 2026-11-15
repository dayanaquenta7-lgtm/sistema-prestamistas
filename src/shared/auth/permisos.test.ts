import { describe, expect, it } from "vitest"
import { cumpleRol, puedeVerSeccion } from "./permisos"

describe("puedeVerSeccion", () => {
  it("el dueño ve todas las secciones", () => {
    for (const seccion of ["inicio", "cobrar-hoy", "configuracion", "auditoria", "caja"]) {
      expect(puedeVerSeccion("dueno", seccion)).toBe(true)
    }
  })

  it("el ayudante no ve inicio, configuración ni auditoría", () => {
    expect(puedeVerSeccion("ayudante", "inicio")).toBe(false)
    expect(puedeVerSeccion("ayudante", "configuracion")).toBe(false)
    expect(puedeVerSeccion("ayudante", "auditoria")).toBe(false)
  })

  it("el ayudante ve las secciones operativas", () => {
    for (const seccion of ["cobrar-hoy", "clientes", "prestamos", "simulador", "caja"]) {
      expect(puedeVerSeccion("ayudante", seccion)).toBe(true)
    }
  })
})

describe("cumpleRol", () => {
  it("el dueño cumple cualquier rol requerido", () => {
    expect(cumpleRol("dueno", "dueno")).toBe(true)
    expect(cumpleRol("dueno", "ayudante")).toBe(true)
  })

  it("el ayudante no cumple el rol de dueño", () => {
    expect(cumpleRol("ayudante", "dueno")).toBe(false)
    expect(cumpleRol("ayudante", "ayudante")).toBe(true)
  })
})
