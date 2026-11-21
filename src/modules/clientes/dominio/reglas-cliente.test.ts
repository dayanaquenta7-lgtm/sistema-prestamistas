import { describe, expect, it } from "vitest"
import {
  cambioDeTasaPermitido,
  planificarAuditoriaEdicion,
  puedeGestionarCondiciones,
  type CamposCliente,
} from "./reglas-cliente"

const base: CamposCliente = {
  nombreCompleto: "Juan Pérez",
  ci: "1234567 LP",
  telefono: "71234567",
  direccion: null,
  referenciaNombre: null,
  referenciaTelefono: null,
  notas: null,
  tasaPreferencial: null,
}

describe("permisos del cliente", () => {
  it("solo el dueño gestiona tasa y marca no prestar", () => {
    expect(puedeGestionarCondiciones("dueno")).toBe(true)
    expect(puedeGestionarCondiciones("ayudante")).toBe(false)
  })

  it("el ayudante no puede definir ni cambiar la tasa", () => {
    expect(cambioDeTasaPermitido("ayudante", null, "2.5000")).toBe(false)
    expect(cambioDeTasaPermitido("ayudante", "2.5000", null)).toBe(false)
    expect(cambioDeTasaPermitido("ayudante", "2.5000", "3.0000")).toBe(false)
  })

  it("el ayudante puede editar otros datos si la tasa queda igual", () => {
    expect(cambioDeTasaPermitido("ayudante", null, null)).toBe(true)
    expect(cambioDeTasaPermitido("ayudante", "2.5000", "2.5")).toBe(true)
  })

  it("el dueño puede cambiar la tasa", () => {
    expect(cambioDeTasaPermitido("dueno", null, "2.5000")).toBe(true)
  })
})

describe("planificarAuditoriaEdicion", () => {
  it("no registra nada si no hubo cambios", () => {
    expect(planificarAuditoriaEdicion(base, { ...base })).toEqual([])
  })

  it("guarda solo los campos que cambiaron", () => {
    expect(planificarAuditoriaEdicion(base, { ...base, telefono: "76543210", direccion: "Calle 1" })).toEqual([
      {
        accion: "cliente.editar",
        valorAnterior: { telefono: "71234567", direccion: null },
        valorNuevo: { telefono: "76543210", direccion: "Calle 1" },
      },
    ])
  })

  it("registra el cambio de tasa por separado", () => {
    expect(planificarAuditoriaEdicion(base, { ...base, tasaPreferencial: "2.5000" })).toEqual([
      {
        accion: "cliente.cambiar_tasa",
        valorAnterior: { tasaPreferencial: null },
        valorNuevo: { tasaPreferencial: "2.5000" },
      },
    ])
  })

  it("con datos y tasa a la vez, deja dos registros", () => {
    const registros = planificarAuditoriaEdicion(
      { ...base, tasaPreferencial: "2.5000" },
      { ...base, nombreCompleto: "Juan Pérez Mamani", tasaPreferencial: "3.0000" },
    )
    expect(registros.map((registro) => registro.accion)).toEqual(["cliente.editar", "cliente.cambiar_tasa"])
    expect(registros[0]?.valorNuevo).toEqual({ nombreCompleto: "Juan Pérez Mamani" })
  })

  it("no considera cambio una tasa con distinta escritura y el mismo valor", () => {
    expect(planificarAuditoriaEdicion({ ...base, tasaPreferencial: "2.5000" }, { ...base, tasaPreferencial: "2.5" })).toEqual(
      [],
    )
  })
})
