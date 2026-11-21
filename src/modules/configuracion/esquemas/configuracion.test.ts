import { describe, expect, it } from "vitest"
import { aEntradaFormulario, CONDICIONES_INICIALES } from "@/modules/prestamos"
import {
  anioDeParametro,
  esquemaDatosNegocio,
  esquemaFeriado,
  esquemaFormularioDefecto,
  esquemaFormularioPlantilla,
  esquemaTope,
  MENSAJES_CONFIGURACION as M,
} from "./configuracion"

const condiciones = aEntradaFormulario(CONDICIONES_INICIALES)

function mensajes(resultado: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return resultado.success ? [] : (resultado.error?.issues ?? []).map((i) => `${i.path.join(".")}: ${i.message}`)
}

describe("esquemaDatosNegocio", () => {
  it("recorta y exige el nombre", () => {
    expect(esquemaDatosNegocio.parse({ nombre: "  Préstamos Ana " })).toEqual({ nombre: "Préstamos Ana" })
    expect(mensajes(esquemaDatosNegocio.safeParse({ nombre: " " }))).toEqual([`nombre: ${M.nombreNegocioObligatorio}`])
  })
})

describe("esquemaTope", () => {
  it.each([
    ["3", "3.0000"],
    ["2,5", "2.5000"],
    ["100", "100.0000"],
  ])("acepta %j", (tope, esperado) => {
    expect(esquemaTope.parse({ tope })).toEqual({ tope: esperado })
  })

  it("rechaza vacío, formato inválido, 0 y más de 100", () => {
    expect(mensajes(esquemaTope.safeParse({ tope: "" }))).toEqual([`tope: ${M.topeObligatorio}`])
    expect(mensajes(esquemaTope.safeParse({ tope: "abc" }))).toEqual([`tope: ${M.topeFormato}`])
    expect(mensajes(esquemaTope.safeParse({ tope: "0" }))).toEqual([`tope: ${M.topeRango}`])
    expect(mensajes(esquemaTope.safeParse({ tope: "100,01" }))).toEqual([`tope: ${M.topeRango}`])
  })
})

describe("esquemaFormularioPlantilla", () => {
  it("normaliza el nombre y convierte las condiciones", () => {
    const datos = esquemaFormularioPlantilla.parse({ nombre: "  Diario   24 días ", condiciones })
    expect(datos.nombre).toBe("Diario 24 días")
    expect(datos.condiciones).toEqual(CONDICIONES_INICIALES)
  })

  it("exige el nombre y anida los errores de condiciones", () => {
    const resultado = esquemaFormularioPlantilla.safeParse({
      nombre: "",
      condiciones: { ...condiciones, frecuencia: "pago_unico" },
    })
    expect(mensajes(resultado)).toEqual([
      `nombre: ${M.nombrePlantillaObligatorio}`,
      "condiciones.numeroCuotas: Con pago único, el número de cuotas debe ser 1.",
    ])
  })

  it("limita el largo del nombre", () => {
    expect(mensajes(esquemaFormularioPlantilla.safeParse({ nombre: "x".repeat(61), condiciones }))).toEqual([
      `nombre: ${M.nombrePlantillaLargo}`,
    ])
  })
})

describe("esquemaFormularioDefecto", () => {
  it("ignora el nombre", () => {
    expect(esquemaFormularioDefecto.parse({ nombre: "", condiciones }).condiciones).toEqual(CONDICIONES_INICIALES)
  })
})

describe("esquemaFeriado", () => {
  it("acepta fecha ISO y descripción", () => {
    expect(esquemaFeriado.parse({ fecha: "2026-08-06", descripcion: " Día de la Patria " })).toEqual({
      fecha: "2026-08-06",
      descripcion: "Día de la Patria",
    })
  })

  it("rechaza fechas inválidas y descripción vacía", () => {
    expect(mensajes(esquemaFeriado.safeParse({ fecha: "2026-02-30", descripcion: "x" }))).toEqual([
      `fecha: ${M.fechaInvalida}`,
    ])
    expect(mensajes(esquemaFeriado.safeParse({ fecha: "2026-01-01", descripcion: "  " }))).toEqual([
      `descripcion: ${M.descripcionObligatoria}`,
    ])
  })
})

describe("anioDeParametro", () => {
  it("usa el año indicado si es razonable; si no, el año actual", () => {
    expect(anioDeParametro("2027", 2026)).toBe(2027)
    expect(anioDeParametro(undefined, 2026)).toBe(2026)
    expect(anioDeParametro("abc", 2026)).toBe(2026)
    expect(anioDeParametro("1999", 2026)).toBe(2026)
    expect(anioDeParametro(["2027", "2028"], 2026)).toBe(2026)
  })
})
