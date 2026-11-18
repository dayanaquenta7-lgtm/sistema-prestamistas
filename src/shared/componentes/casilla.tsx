import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

interface CasillaProps extends Omit<ComponentProps<"input">, "type"> {
  etiqueta: ReactNode
  descripcion?: ReactNode
}

/** Casilla de verificación nativa con toda la fila tocable (al menos 44 px de alto). */
export function Casilla({ etiqueta, descripcion, className, id, ...props }: CasillaProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-md py-2.5 has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        {...props}
      />
      <span className="flex flex-col gap-0.5 text-sm">
        <span>{etiqueta}</span>
        {descripcion ? <span className="text-muted-foreground">{descripcion}</span> : null}
      </span>
    </label>
  )
}
