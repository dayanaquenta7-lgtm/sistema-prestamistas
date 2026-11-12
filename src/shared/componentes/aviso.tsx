import { CircleAlert, CircleCheck, Info } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

type VarianteAviso = "error" | "exito" | "informacion"

const ESTILOS: Record<VarianteAviso, string> = {
  error: "border-estado-mora/30 bg-estado-mora-fondo text-estado-mora-texto",
  exito: "border-estado-vigente/30 bg-estado-vigente-fondo text-estado-vigente-texto",
  informacion: "border-border bg-muted text-foreground",
}

const ICONOS: Record<VarianteAviso, typeof Info> = {
  error: CircleAlert,
  exito: CircleCheck,
  informacion: Info,
}

interface AvisoProps {
  variante: VarianteAviso
  children: ReactNode
  className?: string
}

/** Mensaje en línea (resultado de un formulario, advertencias). */
export function Aviso({ variante, children, className }: AvisoProps) {
  const Icono = ICONOS[variante]
  return (
    <div
      role={variante === "error" ? "alert" : "status"}
      className={cn("flex gap-2 rounded-md border px-3 py-2.5 text-sm", ESTILOS[variante], className)}
    >
      <Icono className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
