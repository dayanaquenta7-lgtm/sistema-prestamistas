import { describe, expect, it } from "vitest"
import { esCodigoInvitacion } from "@/shared/auth/rutas"
import {
  calcularVencimiento,
  estaPendiente,
  evaluarInvitacion,
  generarCodigoInvitacion,
  hashCodigoInvitacion,
  type DatosEvaluacion,
} from "./invitaciones"

const AHORA = new Date("2026-11-18T12:00:00Z")
const VIGENTE = { usadaEn: null, revocadaEn: null, venceEn: new Date("2026-11-25T12:00:00Z") }

function evaluar(cambios: Partial<DatosEvaluacion>) {
  return evaluarInvitacion({ invitacion: VIGENTE, ahora: AHORA, esDueno: false, membresia: null, ...cambios })
}

describe("generarCodigoInvitacion", () => {
  it("genera códigos de 43 caracteres base64url distintos cada vez", () => {
    const codigos = new Set(Array.from({ length: 50 }, generarCodigoInvitacion))
    expect(codigos.size).toBe(50)
    for (const codigo of codigos) expect(esCodigoInvitacion(codigo)).toBe(true)
  })
})

describe("hashCodigoInvitacion", () => {
  it("es SHA-256 en hexadecimal, determinista y distinto del código", () => {
    const codigo = generarCodigoInvitacion()
    const hash = hashCodigoInvitacion(codigo)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hashCodigoInvitacion(codigo)).toBe(hash)
    expect(hash).not.toContain(codigo)
    expect(hashCodigoInvitacion(generarCodigoInvitacion())).not.toBe(hash)
  })
})

describe("calcularVencimiento", () => {
  it("vence a los 7 días (RN-13)", () => {
    expect(calcularVencimiento(AHORA).toISOString()).toBe("2026-11-25T12:00:00.000Z")
  })
})

describe("estaPendiente", () => {
  it("solo si no está usada, ni revocada, ni vencida", () => {
    expect(estaPendiente(VIGENTE, AHORA)).toBe(true)
    expect(estaPendiente({ ...VIGENTE, usadaEn: AHORA }, AHORA)).toBe(false)
    expect(estaPendiente({ ...VIGENTE, revocadaEn: AHORA }, AHORA)).toBe(false)
    expect(estaPendiente({ ...VIGENTE, venceEn: AHORA }, AHORA)).toBe(false)
    expect(estaPendiente({ ...VIGENTE, venceEn: new Date(AHORA.getTime() + 1) }, AHORA)).toBe(true)
  })
})

describe("evaluarInvitacion", () => {
  it("una invitación vigente para alguien ajeno al negocio es válida", () => {
    expect(evaluar({})).toBe("valida")
  })

  it.each([
    ["inexistente", { invitacion: null }],
    ["usada", { invitacion: { ...VIGENTE, usadaEn: AHORA } }],
    ["revocada", { invitacion: { ...VIGENTE, revocadaEn: AHORA } }],
    ["vencida", { invitacion: { ...VIGENTE, venceEn: AHORA } }],
  ])("una invitación %s no está disponible (sin revelar el motivo)", (_, cambios) => {
    expect(evaluar(cambios)).toBe("no_disponible")
  })

  it("el dueño que abre su propio enlace no lo consume", () => {
    expect(evaluar({ esDueno: true })).toBe("es_dueno")
  })

  it("un miembro activo ya forma parte del negocio, aunque el enlace ya no sirva", () => {
    expect(evaluar({ membresia: { activo: true } })).toBe("ya_miembro_activo")
    expect(evaluar({ membresia: { activo: true }, invitacion: { ...VIGENTE, usadaEn: AHORA } })).toBe(
      "ya_miembro_activo",
    )
  })

  it("un miembro desactivado no se reactiva con una invitación", () => {
    expect(evaluar({ membresia: { activo: false } })).toBe("ya_miembro_inactivo")
  })
})
