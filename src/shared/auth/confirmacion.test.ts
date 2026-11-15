import { describe, expect, it } from "vitest"
import { avisoLogin, motivoFalloConfirmacion } from "./confirmacion"

describe("motivoFalloConfirmacion", () => {
  it("detecta el enlace de registro abierto en otro navegador", () => {
    expect(motivoFalloConfirmacion("pkce_code_verifier_not_found", "/completar-registro")).toBe("navegador-registro")
  })

  it("detecta el enlace de recuperación abierto en otro navegador", () => {
    expect(motivoFalloConfirmacion("pkce_code_verifier_not_found", "/restablecer-contrasena")).toBe(
      "navegador-recuperacion",
    )
  })

  it.each([undefined, "otp_expired", "flow_state_expired", "bad_code_verifier"])(
    "trata %j como enlace inválido o vencido",
    (codigo) => {
      expect(motivoFalloConfirmacion(codigo, "/completar-registro")).toBe("enlace")
    },
  )
})

describe("avisoLogin", () => {
  it("traduce los códigos conocidos a mensajes fijos", () => {
    expect(avisoLogin("enlace")?.mensaje).toMatch(/no es válido/)
    expect(avisoLogin("navegador-registro")?.mensaje).toMatch(/donde hiciste el registro/)
    expect(avisoLogin("navegador-registro")?.accion?.href).toBe("/reenviar-confirmacion")
    expect(avisoLogin("navegador-recuperacion")?.accion?.href).toBe("/recuperar-contrasena")
  })

  it.each([undefined, "", "Email link is invalid or has expired", "toString", "__proto__", ["enlace"]])(
    "ignora %j",
    (codigo) => {
      expect(avisoLogin(codigo)).toBeUndefined()
    },
  )
})
