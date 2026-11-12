import { cn } from "@/shared/lib/utils"
import { ESTADOS, type Estado, type TonoEstado } from "./estados"

const CLASES_TONO: Record<TonoEstado, string> = {
  vigente: "border-estado-vigente/30 bg-estado-vigente-fondo text-estado-vigente-texto",
  "por-vencer": "border-estado-por-vencer/40 bg-estado-por-vencer-fondo text-estado-por-vencer-texto",
  mora: "border-estado-mora/30 bg-estado-mora-fondo text-estado-mora-texto",
  cancelado: "border-estado-cancelado/30 bg-estado-cancelado-fondo text-estado-cancelado-texto",
  refinanciado: "border-estado-refinanciado/30 bg-estado-refinanciado-fondo text-estado-refinanciado-texto",
  anulado: "border-estado-anulado/30 bg-estado-anulado-fondo text-estado-anulado-texto line-through",
  neutro: "border-border bg-background text-muted-foreground",
}

export function BadgeEstado({ estado, className }: { estado: Estado; className?: string }) {
  const { etiqueta, tono } = ESTADOS[estado]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-medium whitespace-nowrap",
        CLASES_TONO[tono],
        className,
      )}
    >
      {etiqueta}
    </span>
  )
}
