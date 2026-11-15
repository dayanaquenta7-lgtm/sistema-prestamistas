import { describe, expect, it } from "vitest"
import { Decimal } from "./dinero"
import { calcularCambios, construirRegistroAuditoria, normalizarValor } from "./auditoria"

const base = {
  negocioId: "neg-1",
  usuarioId: "usr-1",
  entidad: "negocio",
  entidadId: "neg-1",
}

describe("normalizarValor", () => {
  it("guarda los Decimal como texto sin perder precisión", () => {
    expect(normalizarValor(new Decimal("1234.5678"))).toBe("1234.5678")
  })

  it("guarda las fechas en ISO", () => {
    expect(normalizarValor(new Date("2026-03-16T03:30:00Z"))).toBe("2026-03-16T03:30:00.000Z")
  })

  it("omite undefined en objetos y lo convierte en null dentro de listas", () => {
    expect(normalizarValor({ a: 1, b: undefined })).toEqual({ a: 1 })
    expect(normalizarValor([1, undefined])).toEqual([1, null])
  })

  it("normaliza estructuras anidadas", () => {
    expect(normalizarValor({ condiciones: { tasa: new Decimal("3.5") } })).toEqual({
      condiciones: { tasa: "3.5" },
    })
  })
})

describe("calcularCambios", () => {
  it("conserva solo los campos que cambiaron", () => {
    expect(
      calcularCambios({ nombre: "A", moneda: "BOB" }, { nombre: "B", moneda: "BOB" }),
    ).toEqual({ anterior: { nombre: "A" }, nuevo: { nombre: "B" } })
  })

  it("registra campos agregados o quitados como null del otro lado", () => {
    expect(calcularCambios({ a: 1 }, { b: 2 })).toEqual({
      anterior: { a: 1, b: null },
      nuevo: { a: null, b: 2 },
    })
  })
})

describe("construirRegistroAuditoria", () => {
  it("arma un registro de creación solo con valor nuevo", () => {
    const registro = construirRegistroAuditoria({
      ...base,
      accion: "negocio.crear",
      valorNuevo: { nombre: "Préstamos Ana", moneda: "BOB" },
    })
    expect(registro).toEqual({
      ...base,
      accion: "negocio.crear",
      valorAnterior: null,
      valorNuevo: { nombre: "Préstamos Ana", moneda: "BOB" },
    })
  })

  it("en una modificación guarda solo la diferencia", () => {
    const registro = construirRegistroAuditoria({
      ...base,
      accion: "negocio.editar",
      valorAnterior: { nombre: "A", tope: new Decimal("3") },
      valorNuevo: { nombre: "A", tope: new Decimal("2.5") },
    })
    expect(registro.valorAnterior).toEqual({ tope: "3" })
    expect(registro.valorNuevo).toEqual({ tope: "2.5" })
  })

  it("rechaza acciones sin el formato entidad.verbo", () => {
    expect(() => construirRegistroAuditoria({ ...base, accion: "crear" })).toThrow()
    expect(() => construirRegistroAuditoria({ ...base, accion: "Negocio.Crear" })).toThrow()
  })

  it("exige la entidad", () => {
    expect(() =>
      construirRegistroAuditoria({ ...base, entidad: " ", accion: "negocio.crear" }),
    ).toThrow()
  })
})
