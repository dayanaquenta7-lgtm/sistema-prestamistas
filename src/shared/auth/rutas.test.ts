import { describe, expect, it } from "vitest"
import { destinoConfirmacion, esRutaPublica } from "./rutas"

describe("destinoConfirmacion", () => {
  it("acepta solo destinos de la lista permitida", () => {
    expect(destinoConfirmacion("/completar-registro")).toBe("/completar-registro")
    expect(destinoConfirmacion("/restablecer-contrasena")).toBe("/restablecer-contrasena")
  })

  it.each([null, "", "https://sitio-malicioso.com", "//sitio-malicioso.com", "/auditoria", "/completar-registro/../x"])(
    "envía %j al inicio del panel",
    (siguiente) => {
      expect(destinoConfirmacion(siguiente)).toBe("/cobrar-hoy")
    },
  )
})

describe("esRutaPublica", () => {
  it("reconoce las rutas de acceso", () => {
    expect(esRutaPublica("/login")).toBe(true)
    expect(esRutaPublica("/auth/confirm")).toBe(true)
  })

  it("no confunde prefijos parecidos", () => {
    expect(esRutaPublica("/login-falso")).toBe(false)
    expect(esRutaPublica("/cobrar-hoy")).toBe(false)
    expect(esRutaPublica("/completar-registro")).toBe(false)
  })
})
