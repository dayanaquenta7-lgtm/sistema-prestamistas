import { describe, expect, it } from "vitest"
import { mensajeErrorAuth } from "./mensajes-auth"

describe("mensajeErrorAuth", () => {
  it("traduce las credenciales inválidas sin revelar si el correo existe", () => {
    expect(mensajeErrorAuth("invalid_credentials")).toBe("Correo o contraseña incorrectos.")
  })

  it("explica que falta confirmar el correo", () => {
    expect(mensajeErrorAuth("email_not_confirmed")).toContain("confirmaste tu correo")
  })

  it("usa un mensaje genérico para códigos desconocidos", () => {
    expect(mensajeErrorAuth(undefined)).toContain("No pudimos completar")
    expect(mensajeErrorAuth("codigo_raro")).toContain("No pudimos completar")
  })
})
