import { Ban } from "lucide-react"
import { cn } from "@/shared/lib/utils"

/** Marca "no prestar": color de alerta siempre acompañado de texto (CLAUDE.md, sección 7). */
export function BadgeNoPrestar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-estado-mora/30 bg-estado-mora-fondo px-2 py-0.5 text-sm font-medium whitespace-nowrap text-estado-mora-texto",
        className,
      )}
    >
      <Ban className="size-3.5" aria-hidden="true" />
      No prestar
    </span>
  )
}
