import { describe, expect, it } from "vitest"
import { SECCIONES, esSeccionActiva, seccionesVisibles } from "./secciones"

describe("seccionesVisibles", () => {
  it("el dueño ve las 8 secciones del MVP", () => {
    expect(seccionesVisibles("dueno").map((s) => s.id)).toEqual([
      "cobrar-hoy",
      "inicio",
      "clientes",
      "prestamos",
      "simulador",
      "caja",
      "configuracion",
      "auditoria",
    ])
  })

  it("el ayudante no ve inicio, configuración ni auditoría", () => {
    expect(seccionesVisibles("ayudante").map((s) => s.id)).toEqual([
      "cobrar-hoy",
      "clientes",
      "prestamos",
      "simulador",
      "caja",
    ])
  })
})

describe("SECCIONES", () => {
  it("la barra inferior del celular tiene a lo sumo 4 secciones más el botón Más", () => {
    expect(SECCIONES.filter((s) => s.principalMovil)).toHaveLength(4)
  })
})

describe("esSeccionActiva", () => {
  const clientes = SECCIONES.find((s) => s.id === "clientes")!

  it("marca la sección y sus subrutas", () => {
    expect(esSeccionActiva(clientes, "/clientes")).toBe(true)
    expect(esSeccionActiva(clientes, "/clientes/123")).toBe(true)
  })

  it("no confunde prefijos parecidos", () => {
    expect(esSeccionActiva(clientes, "/clientes-archivados")).toBe(false)
  })
})
