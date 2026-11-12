import { CircleAlert, Inbox } from "lucide-react"
import type { ReactNode } from "react"

interface EstadoVistaProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

/** Vista vacía: mensaje claro y acción sugerida. */
export function EstadoVacio({ titulo, descripcion, accion }: EstadoVistaProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed px-4 py-10 text-center">
      <Inbox className="size-5 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">{titulo}</p>
      {descripcion ? <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p> : null}
      {accion ? <div className="mt-2">{accion}</div> : null}
    </div>
  )
}

/** Vista de error con opción de reintentar. */
export function EstadoError({ titulo, descripcion, accion }: EstadoVistaProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-md border border-estado-mora/30 bg-estado-mora-fondo px-4 py-10 text-center"
    >
      <CircleAlert className="size-5 text-estado-mora-texto" aria-hidden="true" />
      <p className="font-medium text-estado-mora-texto">{titulo}</p>
      {descripcion ? <p className="max-w-sm text-sm text-estado-mora-texto">{descripcion}</p> : null}
      {accion ? <div className="mt-2">{accion}</div> : null}
    </div>
  )
}
