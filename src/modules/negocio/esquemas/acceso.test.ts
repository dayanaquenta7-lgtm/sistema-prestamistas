import { describe, expect, it } from "vitest"
import {
  esquemaCompletarRegistro,
  esquemaInicioSesion,
  esquemaReenviarConfirmacion,
  esquemaRegistro,
  esquemaRestablecerContrasena,
} from "./acceso"

const registroValido = {
  nombre: "Ana Pérez",
  nombreNegocio: "Préstamos Ana",
  correo: "  Ana@Correo.com ",
  contrasena: "secreta123",
  confirmacion: "secreta123",
}

describe("esquemaRegistro", () => {
  it("acepta datos válidos y normaliza el correo", () => {
    const resultado = esquemaRegistro.parse(registroValido)
    expect(resultado.correo).toBe("ana@correo.com")
  })

  it("exige al menos 8 caracteres en la contraseña", () => {
    const resultado = esquemaRegistro.safeParse({ ...registroValido, contrasena: "corta", confirmacion: "corta" })
    expect(resultado.success).toBe(false)
  })

  it("marca el error en la confirmación si las contraseñas no coinciden", () => {
    const resultado = esquemaRegistro.safeParse({ ...registroValido, confirmacion: "otra12345" })
    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues[0]?.path).toEqual(["confirmacion"])
  })

  it("rechaza correos inválidos", () => {
    expect(esquemaRegistro.safeParse({ ...registroValido, correo: "ana" }).success).toBe(false)
  })
})

describe("esquemaCompletarRegistro", () => {
  it("recorta espacios y exige nombres", () => {
    expect(esquemaCompletarRegistro.parse({ nombre: " Ana ", nombreNegocio: " Mi negocio " })).toEqual({
      nombre: "Ana",
      nombreNegocio: "Mi negocio",
    })
    expect(esquemaCompletarRegistro.safeParse({ nombre: " ", nombreNegocio: "X" }).success).toBe(false)
  })
})

describe("esquemaInicioSesion", () => {
  it("exige contraseña", () => {
    expect(esquemaInicioSesion.safeParse({ correo: "a@b.com", contrasena: "" }).success).toBe(false)
  })
})

describe("esquemaReenviarConfirmacion", () => {
  it("normaliza el correo y rechaza los inválidos", () => {
    expect(esquemaReenviarConfirmacion.parse({ correo: " Ana@Correo.com " })).toEqual({ correo: "ana@correo.com" })
    expect(esquemaReenviarConfirmacion.safeParse({ correo: "ana" }).success).toBe(false)
  })
})

describe("esquemaRestablecerContrasena", () => {
  it("exige que ambas contraseñas coincidan", () => {
    expect(
      esquemaRestablecerContrasena.safeParse({ contrasena: "nueva1234", confirmacion: "nueva1234" }).success,
    ).toBe(true)
    expect(
      esquemaRestablecerContrasena.safeParse({ contrasena: "nueva1234", confirmacion: "nueva12345" }).success,
    ).toBe(false)
  })
})
