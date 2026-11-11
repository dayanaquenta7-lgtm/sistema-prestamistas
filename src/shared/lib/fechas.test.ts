import { describe, expect, it } from "vitest"
import {
  esFechaNegocio,
  formatearFecha,
  formatearFechaHora,
  hoyEnZona,
  parsearFechaUsuario,
} from "./fechas"

describe("hoyEnZona", () => {
  it("devuelve el día de La Paz aunque en UTC ya sea el día siguiente", () => {
    // 15/03/2026 23:30 en La Paz = 16/03/2026 03:30 UTC
    const ahora = new Date("2026-03-16T03:30:00Z")
    expect(hoyEnZona("America/La_Paz", ahora)).toBe("2026-03-15")
  })

  it("cambia de día a la medianoche de La Paz", () => {
    expect(hoyEnZona("America/La_Paz", new Date("2026-03-16T03:59:59Z"))).toBe("2026-03-15")
    expect(hoyEnZona("America/La_Paz", new Date("2026-03-16T04:00:00Z"))).toBe("2026-03-16")
  })

  it("usa America/La_Paz por defecto", () => {
    expect(hoyEnZona(undefined, new Date("2026-01-01T02:00:00Z"))).toBe("2025-12-31")
  })

  it("respeta otra zona horaria", () => {
    expect(hoyEnZona("UTC", new Date("2026-03-16T03:30:00Z"))).toBe("2026-03-16")
  })
})

describe("formatearFecha", () => {
  it("formatea una fecha de negocio como dd/mm/aaaa sin convertir zona", () => {
    expect(formatearFecha("2026-03-05")).toBe("05/03/2026")
    expect(formatearFecha("2026-12-31")).toBe("31/12/2026")
  })

  it("formatea un instante en la zona del negocio", () => {
    expect(formatearFecha(new Date("2026-03-16T03:30:00Z"))).toBe("15/03/2026")
  })

  it("rechaza fechas inválidas", () => {
    expect(() => formatearFecha("2026-02-30")).toThrow()
    expect(() => formatearFecha("05/03/2026")).toThrow()
  })
})

describe("formatearFechaHora", () => {
  it("muestra fecha y hora en La Paz", () => {
    expect(formatearFechaHora(new Date("2026-03-16T03:30:00Z"))).toBe("15/03/2026 23:30")
  })
})

describe("parsearFechaUsuario", () => {
  it("convierte dd/mm/aaaa a aaaa-mm-dd", () => {
    expect(parsearFechaUsuario("05/03/2026")).toBe("2026-03-05")
    expect(parsearFechaUsuario(" 29/02/2028 ")).toBe("2028-02-29")
  })

  it.each(["", "5/3/2026", "2026-03-05", "31/02/2026", "29/02/2026", "32/01/2026"])(
    "rechaza %j",
    (texto) => {
      expect(parsearFechaUsuario(texto)).toBeNull()
    },
  )
})

describe("esFechaNegocio", () => {
  it("valida el formato y que la fecha exista", () => {
    expect(esFechaNegocio("2026-03-05")).toBe(true)
    expect(esFechaNegocio("2026-13-01")).toBe(false)
    expect(esFechaNegocio("2026-3-5")).toBe(false)
  })
})
