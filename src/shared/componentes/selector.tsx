import { ChevronDown } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "@/shared/lib/utils"

export interface OpcionSelector {
  valor: string
  etiqueta: string
}

interface SelectorProps extends Omit<ComponentProps<"select">, "children"> {
  opciones: readonly OpcionSelector[]
}

/**
 * Lista desplegable nativa con el estilo de Input. En el celular abre el
 * selector del sistema, que es el más cómodo para el usuario.
 */
export function Selector({ opciones, className, ...props }: SelectorProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent py-1 pr-9 pl-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:h-9 md:text-sm dark:bg-input/30",
          className,
        )}
        {...props}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
}

/** Convierte un mapa de etiquetas en opciones, en el orden de la lista de valores. */
export function opcionesDe<T extends string>(valores: readonly T[], etiquetas: Record<T, string>): OpcionSelector[] {
  return valores.map((valor) => ({ valor, etiqueta: etiquetas[valor] }))
}
