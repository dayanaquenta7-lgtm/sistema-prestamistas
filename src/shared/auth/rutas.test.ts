import { describe, expect, it } from "vitest"
import { destinoPermitido, esCodigoInvitacion, esRutaPublica, rutaInvitacion } from "./rutas"

const CODIGO = "a".repeat(20) + "B_-9".repeat(5) + "xyz"

describe("esCodigoInvitacion", () => {
  it("acepta 43 caracteres base64url", () => {
    expect(CODIGO).toHaveLength(43)
    expect(esCodigoInvitacion(CODIGO)).toBe(true)
  })

  it.each(["", "a".repeat(42), "a".repeat(44), `${"a".repeat(42)}=`, `${"a".repeat(42)}/`, null])(
    "rechaza %j",
    (codigo) => {
      expect(esCodigoInvitacion(codigo)).toBe(false)
    },
  )
})

describe("destinoPermitido", () => {
  it("acepta solo destinos de la lista permitida", () => {
    expect(destinoPermitido("/completar-registro")).toBe("/completar-registro")
    expect(destinoPermitido("/restablecer-contrasena")).toBe("/restablecer-contrasena")
  })

  it("acepta la página de una invitación con código bien formado", () => {
    expect(destinoPermitido(rutaInvitacion(CODIGO))).toBe(`/invitacion/${CODIGO}`)
  })

  it.each([
    null,
    "",
    "https://sitio-malicioso.com",
    "//sitio-malicioso.com",
    "/auditoria",
    "/completar-registro/../x",
    "/invitacion/corto",
    `/invitacion/${CODIGO}/x`,
    `/invitacion/${CODIGO}?x=1`,
    `//invitacion/${CODIGO}`,
  ])("envía %j al inicio del panel", (siguiente) => {
    expect(destinoPermitido(siguiente)).toBe("/cobrar-hoy")
  })
})

describe("esRutaPublica", () => {
  it("reconoce las rutas de acceso y las invitaciones", () => {
    expect(esRutaPublica("/login")).toBe(true)
    expect(esRutaPublica("/auth/confirm")).toBe(true)
    expect(esRutaPublica(`/invitacion/${CODIGO}`)).toBe(true)
  })

  it("no confunde prefijos parecidos", () => {
    expect(esRutaPublica("/login-falso")).toBe(false)
    expect(esRutaPublica("/invitaciones")).toBe(false)
    expect(esRutaPublica("/cobrar-hoy")).toBe(false)
    expect(esRutaPublica("/completar-registro")).toBe(false)
  })
})
