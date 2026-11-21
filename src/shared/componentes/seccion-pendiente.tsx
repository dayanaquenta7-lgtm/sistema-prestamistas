import { EncabezadoPagina } from "./encabezado-pagina"
import { EstadoVacio } from "./estado-vista"

/** Página de una sección del MVP que todavía no tiene contenido. */
export function SeccionPendiente({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina titulo={titulo} />
      <EstadoVacio
        titulo="Sección en construcción"
        descripcion="Esta sección estará disponible en una próxima versión."
      />
    </div>
  )
}
