import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { crearColumnas, TablaDatos } from "./tabla-datos"

interface Fila {
  id: string
  cliente: string
  monto: string
}

const columna = crearColumnas<Fila>()
const columnas = columna.columns([
  columna.accessor("cliente", { header: "Cliente" }),
  columna.accessor("monto", { header: "Monto", meta: { alinear: "derecha" } }),
])

function filas(cantidad: number): Fila[] {
  return Array.from({ length: cantidad }, (_, indice) => ({
    id: `f${indice + 1}`,
    cliente: `Cliente ${indice + 1}`,
    monto: `Bs ${indice + 1},00`,
  }))
}

function renderizar(datos: Fila[], tamanoPagina?: number) {
  return renderToStaticMarkup(
    createElement(TablaDatos<Fila>, {
      columnas,
      datos,
      tamanoPagina,
      claveFila: (fila: Fila) => fila.id,
      vacio: { titulo: "Todavía no hay clientes", descripcion: "Registra el primero." },
    }),
  )
}

describe("TablaDatos", () => {
  it("muestra el estado vacío cuando no hay datos", () => {
    const html = renderizar([])
    expect(html).toContain("Todavía no hay clientes")
    expect(html).not.toContain("<table")
  })

  it("renderiza encabezados y celdas, con montos alineados a la derecha", () => {
    const html = renderizar(filas(2))
    expect(html).toContain("Cliente")
    expect(html).toContain("Cliente 2")
    expect(html).toMatch(/text-right tabular-nums[^>]*>Bs 1,00/)
  })

  it("pagina los datos y muestra la paginación solo si hay más de una página", () => {
    const html = renderizar(filas(25), 10)
    expect(html).toContain("Página 1 de 3")
    expect(html).toContain("Cliente 10")
    expect(html).not.toContain("Cliente 11<")

    expect(renderizar(filas(5), 10)).not.toContain("Página 1 de")
  })
})
