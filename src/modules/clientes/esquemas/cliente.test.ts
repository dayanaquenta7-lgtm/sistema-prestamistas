import { describe, expect, it } from "vitest"
import {
  ENTRADA_CLIENTE_VACIA,
  esquemaBusquedaClientes,
  esquemaCliente,
  esquemaMarcarNoPrestar,
  type EntradaCliente,
} from "./cliente"

const valido: EntradaCliente = { ...ENTRADA_CLIENTE_VACIA, nombreCompleto: "  Juan Pérez  " }

function errores(entrada: Partial<EntradaCliente>) {
  const resultado = esquemaCliente.safeParse({ ...valido, ...entrada })
  return resultado.success ? [] : resultado.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
}

describe("esquemaCliente", () => {
  it("solo exige el nombre; los opcionales vacíos quedan en null", () => {
    expect(esquemaCliente.parse(valido)).toEqual({
      nombreCompleto: "Juan Pérez",
      ci: null,
      telefono: null,
      direccion: null,
      referenciaNombre: null,
      referenciaTelefono: null,
      notas: null,
      tasaPreferencial: null,
    })
  })

  it("exige el nombre completo", () => {
    expect(errores({ nombreCompleto: "   " })).toEqual(["nombreCompleto: Ingresa el nombre completo"])
  })

  it("normaliza el CI y la tasa", () => {
    const datos = esquemaCliente.parse({ ...valido, ci: " 1234567  lp ", tasaPreferencial: "2,5" })
    expect(datos.ci).toBe("1234567 LP")
    expect(datos.tasaPreferencial).toBe("2.5000")
  })

  it.each(["123#45", "-123"])("rechaza el CI %j", (ci) => {
    expect(errores({ ci })[0]).toMatch(/^ci: CI inválido/)
  })

  it.each(["71234567", "+591 71234567", "2-2441234"])("acepta el teléfono %j", (telefono) => {
    expect(errores({ telefono })).toEqual([])
  })

  it.each(["123", "abc12345", "+591 7123 4567 8901 23"])("rechaza el teléfono %j", (telefono) => {
    expect(errores({ telefono })[0]).toMatch(/^telefono: Teléfono inválido|demasiado largo/)
  })

  it("valida el teléfono de la referencia con la misma regla", () => {
    expect(errores({ referenciaTelefono: "12" })[0]).toMatch(/^referenciaTelefono: Teléfono inválido/)
  })

  it("rechaza tasas inválidas o mayores a 100", () => {
    expect(errores({ tasaPreferencial: "abc" })).toEqual([
      "tasaPreferencial: Tasa inválida. Usa hasta 4 decimales, por ejemplo 2,5",
    ])
    expect(errores({ tasaPreferencial: "100,5" })).toEqual(["tasaPreferencial: La tasa no puede ser mayor a 100 %"])
    expect(errores({ tasaPreferencial: "100" })).toEqual([])
  })

  it("limita el largo de las notas", () => {
    expect(errores({ notas: "x".repeat(1001) })).toEqual(["notas: Las notas son demasiado largas"])
  })
})

describe("esquemaMarcarNoPrestar", () => {
  it("exige motivo", () => {
    expect(esquemaMarcarNoPrestar.safeParse({ motivo: "  " }).success).toBe(false)
    expect(esquemaMarcarNoPrestar.parse({ motivo: " No pagó " })).toEqual({ motivo: "No pagó" })
  })
})

describe("esquemaBusquedaClientes", () => {
  it("recorta y descarta valores inválidos", () => {
    expect(esquemaBusquedaClientes.parse("  ana ")).toBe("ana")
    expect(esquemaBusquedaClientes.parse(["a", "b"])).toBe("")
    expect(esquemaBusquedaClientes.parse(undefined)).toBe("")
  })
})
