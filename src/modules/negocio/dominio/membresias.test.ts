import { describe, expect, it } from "vitest"
import { MENSAJES_MEMBRESIAS as M, validarCambioMembresia, type MembresiaObjetivo } from "./membresias"

const DUENO = "usuario-dueno"
const ayudante: MembresiaObjetivo = { usuarioId: "usuario-ayudante", rol: "ayudante", activo: true, puedeCrearPrestamos: false }
const propia: MembresiaObjetivo = { usuarioId: DUENO, rol: "dueno", activo: true, puedeCrearPrestamos: true }

describe("validarCambioMembresia", () => {
  it("el dueño puede desactivar y reactivar a un ayudante", () => {
    expect(validarCambioMembresia(DUENO, ayudante, { tipo: "activo", valor: false })).toBeNull()
    expect(validarCambioMembresia(DUENO, { ...ayudante, activo: false }, { tipo: "activo", valor: true })).toBeNull()
  })

  it("el dueño puede dar y quitar el permiso de crear préstamos", () => {
    expect(validarCambioMembresia(DUENO, ayudante, { tipo: "permiso", valor: true })).toBeNull()
    expect(
      validarCambioMembresia(DUENO, { ...ayudante, puedeCrearPrestamos: true }, { tipo: "permiso", valor: false }),
    ).toBeNull()
  })

  it("el dueño no puede desactivarse a sí mismo", () => {
    expect(validarCambioMembresia(DUENO, propia, { tipo: "activo", valor: false })).toBe(M.noDesactivarseASiMismo)
  })

  it("el dueño no puede quitarse permisos a sí mismo", () => {
    expect(validarCambioMembresia(DUENO, propia, { tipo: "permiso", valor: false })).toBe(M.noCambiarPropiosPermisos)
  })

  it("no se modifica la membresía de un dueño", () => {
    expect(validarCambioMembresia(DUENO, { ...propia, usuarioId: "otro-dueno" }, { tipo: "activo", valor: false })).toBe(
      M.soloAyudantes,
    )
  })

  it("rechaza cambios que no cambian nada", () => {
    expect(validarCambioMembresia(DUENO, ayudante, { tipo: "activo", valor: true })).toBe(M.yaActivo)
    expect(validarCambioMembresia(DUENO, { ...ayudante, activo: false }, { tipo: "activo", valor: false })).toBe(
      M.yaInactivo,
    )
    expect(validarCambioMembresia(DUENO, ayudante, { tipo: "permiso", valor: false })).toBe(M.permisoSinCambios)
  })
})
