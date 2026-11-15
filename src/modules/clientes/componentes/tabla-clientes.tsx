"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { BadgeEstado } from "@/shared/componentes/badge-estado"
import { crearColumnas, TablaDatos } from "@/shared/componentes/tabla-datos"
import type { ClienteListado } from "../consultas/clientes"
import { BadgeNoPrestar } from "./badge-no-prestar"

const columna = crearColumnas<ClienteListado>()

function Estados({ cliente }: { cliente: ClienteListado }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      <BadgeEstado estado={cliente.estado} />
      {cliente.noPrestar ? <BadgeNoPrestar /> : null}
    </span>
  )
}

const columnas = columna.columns([
  columna.accessor("nombreCompleto", {
    header: "Nombre",
    cell: ({ row }) => (
      <Link
        href={`/clientes/${row.original.id}`}
        className="inline-flex min-h-9 items-center font-medium text-primary underline-offset-4 hover:underline"
      >
        {row.original.nombreCompleto}
      </Link>
    ),
  }),
  columna.accessor("ci", { header: "CI", cell: ({ getValue }) => getValue() ?? "—" }),
  columna.accessor("telefono", { header: "Teléfono", cell: ({ getValue }) => getValue() ?? "—" }),
  columna.display({ id: "estado", header: "Estado", cell: ({ row }) => <Estados cliente={row.original} /> }),
])

function FilaMovil(cliente: ClienteListado) {
  const detalle = [cliente.ci ? `CI ${cliente.ci}` : null, cliente.telefono].filter(Boolean).join(" · ")
  return (
    <Link href={`/clientes/${cliente.id}`} className="-m-3 flex min-h-11 items-center gap-3 p-3">
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-medium">{cliente.nombreCompleto}</span>
        {detalle ? <span className="text-sm text-muted-foreground">{detalle}</span> : null}
        <Estados cliente={cliente} />
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}

interface TablaClientesProps {
  clientes: ClienteListado[]
  filtros: ReactNode
  vacio: { titulo: string; descripcion?: string; accion?: ReactNode }
}

export function TablaClientes({ clientes, filtros, vacio }: TablaClientesProps) {
  return (
    <TablaDatos
      columnas={columnas}
      datos={clientes}
      filtros={filtros}
      vacio={vacio}
      filaMovil={FilaMovil}
      claveFila={(cliente) => cliente.id}
    />
  )
}
