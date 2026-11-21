"use client"

import {
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type RowData,
  type TableOptions,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { EstadoVacio } from "./estado-vista"

export interface MetaColumna {
  /** Montos y cifras a la derecha (CLAUDE.md, sección 7). */
  alinear?: "derecha"
  /** Etiqueta en la vista de lista móvil; por defecto, el encabezado. */
  etiquetaMovil?: string
  /** Oculta la columna en la vista de lista móvil (por ejemplo, acciones duplicadas). */
  ocultarEnMovil?: boolean
}

export const caracteristicasTabla = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: {} as MetaColumna,
})

export type CaracteristicasTabla = typeof caracteristicasTabla
/** Columnas que acepta TablaDatos; crearlas con crearColumnas<T>().columns([...]). */
export type ColumnasTabla<T extends RowData> = TableOptions<CaracteristicasTabla, T>["columns"]

/** Helper para definir columnas con tipos inferidos. */
export function crearColumnas<T extends RowData>() {
  return createColumnHelper<CaracteristicasTabla, T>()
}

interface TablaDatosProps<T extends RowData> {
  columnas: ColumnasTabla<T>
  datos: T[]
  /** Filtros u otras acciones encima de la tabla. */
  filtros?: ReactNode
  vacio: { titulo: string; descripcion?: string; accion?: ReactNode }
  tamanoPagina?: number
  /** Vista de lista propia para móvil; si no se da, se apilan las columnas. */
  filaMovil?: (fila: T) => ReactNode
  claveFila?: (fila: T, indice: number) => string
}

export function TablaDatos<T extends RowData>({
  columnas,
  datos,
  filtros,
  vacio,
  tamanoPagina = 20,
  filaMovil,
  claveFila,
}: TablaDatosProps<T>) {
  const tabla = useTable({
    features: caracteristicasTabla,
    columns: columnas,
    data: datos,
    initialState: { pagination: { pageIndex: 0, pageSize: tamanoPagina } },
    getRowId: claveFila ? (fila, indice) => claveFila(fila, indice) : undefined,
  })

  const filas = tabla.getRowModel().rows
  const totalPaginas = tabla.getPageCount()
  const paginaActual = tabla.state.pagination.pageIndex + 1

  return (
    <div className="flex flex-col gap-3">
      {filtros ? <div className="flex flex-col gap-2 md:flex-row md:items-end">{filtros}</div> : null}

      {datos.length === 0 ? (
        <EstadoVacio {...vacio} />
      ) : (
        <>
          {/* Escritorio: tabla */}
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                {tabla.getHeaderGroups().map((grupo) => (
                  <TableRow key={grupo.id}>
                    {grupo.headers.map((encabezado) => (
                      <TableHead
                        key={encabezado.id}
                        className={cn(encabezado.column.columnDef.meta?.alinear === "derecha" && "text-right")}
                      >
                        {encabezado.isPlaceholder ? null : <tabla.FlexRender header={encabezado} />}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {filas.map((fila) => (
                  <TableRow key={fila.id}>
                    {fila.getAllCells().map((celda) => (
                      <TableCell
                        key={celda.id}
                        className={cn(
                          celda.column.columnDef.meta?.alinear === "derecha" && "text-right tabular-nums",
                        )}
                      >
                        <tabla.FlexRender cell={celda} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Móvil: lista */}
          <ul className="flex flex-col gap-2 md:hidden">
            {filas.map((fila) => (
              <li key={fila.id} className="rounded-md border bg-card p-3">
                {filaMovil ? (
                  filaMovil(fila.original)
                ) : (
                  <dl className="flex flex-col gap-1.5">
                    {fila
                      .getAllCells()
                      .filter((celda) => !celda.column.columnDef.meta?.ocultarEnMovil)
                      .map((celda) => {
                        const { meta, header } = celda.column.columnDef
                        const etiqueta = meta?.etiquetaMovil ?? (typeof header === "string" ? header : "")
                        return (
                          <div key={celda.id} className="flex items-start justify-between gap-3 text-sm">
                            {etiqueta ? <dt className="text-muted-foreground">{etiqueta}</dt> : null}
                            <dd className={cn("text-right", meta?.alinear === "derecha" && "tabular-nums")}>
                              <tabla.FlexRender cell={celda} />
                            </dd>
                          </div>
                        )
                      })}
                  </dl>
                )}
              </li>
            ))}
          </ul>

          {totalPaginas > 1 ? (
            <nav className="flex items-center justify-between gap-2" aria-label="Paginación">
              <p className="text-sm text-muted-foreground">
                Página {paginaActual} de {totalPaginas}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => tabla.previousPage()}
                  disabled={!tabla.getCanPreviousPage()}
                  aria-label="Página anterior"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => tabla.nextPage()}
                  disabled={!tabla.getCanNextPage()}
                  aria-label="Página siguiente"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </nav>
          ) : null}
        </>
      )}
    </div>
  )
}

/** Estado de carga de una tabla (usar como fallback de Suspense). */
export function EsqueletoTabla({ filas = 5 }: { filas?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: filas }, (_, indice) => (
        <Skeleton key={indice} className="h-11 w-full" />
      ))}
    </div>
  )
}
