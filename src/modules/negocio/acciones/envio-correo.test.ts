import { describe, expect, it } from "vitest"
import { clasificarErrorEnvio } from "./envio-correo"

describe("clasificarErrorEnvio", () => {
  it("oculta el límite por usuario para no revelar si el correo existe", () => {
    expect(clasificarErrorEnvio("over_email_send_rate_limit")).toBe("limite-correo")
  })

  it("muestra el límite por IP", () => {
    expect(clasificarErrorEnvio("over_request_rate_limit")).toBe("limite-solicitudes")
  })

  it.each([undefined, "user_not_found", "email_address_invalid", "validation_failed"])(
    "responde %j como éxito genérico",
    (codigo) => {
      expect(clasificarErrorEnvio(codigo)).toBe("exito")
    },
  )
})
