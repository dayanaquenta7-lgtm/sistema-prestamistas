import { describe, expect, it, vi } from "vitest"
import type { Transaccion } from "./cliente"
import { registrarAuditoria } from "./auditoria"
import { auditoria } from "./schema"

function transaccionSimulada() {
  const values = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn().mockReturnValue({ values })
  return { tx: { insert } as unknown as Transaccion, insert, values }
}

describe("registrarAuditoria", () => {
  it("inserta el registro normalizado en la tabla auditoria", async () => {
    const { tx, insert, values } = transaccionSimulada()

    await registrarAuditoria(tx, {
      negocioId: "neg-1",
      usuarioId: "usr-1",
      accion: "negocio.crear",
      entidad: "negocio",
      entidadId: "neg-1",
      valorNuevo: { nombre: "Préstamos Ana", fecha: new Date("2026-01-01T00:00:00Z") },
    })

    expect(insert).toHaveBeenCalledWith(auditoria)
    expect(values).toHaveBeenCalledWith({
      negocioId: "neg-1",
      usuarioId: "usr-1",
      accion: "negocio.crear",
      entidad: "negocio",
      entidadId: "neg-1",
      valorAnterior: null,
      valorNuevo: { nombre: "Préstamos Ana", fecha: "2026-01-01T00:00:00.000Z" },
    })
  })

  it("no inserta nada si los datos son inválidos", async () => {
    const { tx, insert } = transaccionSimulada()
    await expect(
      registrarAuditoria(tx, {
        negocioId: "neg-1",
        usuarioId: "usr-1",
        accion: "invalida",
        entidad: "negocio",
        entidadId: null,
      }),
    ).rejects.toThrow()
    expect(insert).not.toHaveBeenCalled()
  })
})
