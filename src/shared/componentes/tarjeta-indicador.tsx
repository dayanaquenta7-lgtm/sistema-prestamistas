import { cn } from "@/shared/lib/utils"

interface TarjetaIndicadorProps {
  titulo: string
  /** Valor ya formateado (por ejemplo, con formatearMonto). */
  valor: string
  detalle?: string
  /** Resalta un indicador que exige atención (por ejemplo, monto en mora). */
  alerta?: boolean
  className?: string
}

/** Solo para los 3 a 5 indicadores clave de una pantalla (CLAUDE.md, sección 7). */
export function TarjetaIndicador({ titulo, valor, detalle, alerta = false, className }: TarjetaIndicadorProps) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-md border bg-card p-4", className)}>
      <p className="text-sm text-muted-foreground">{titulo}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", alerta && "text-estado-mora-texto")}>{valor}</p>
      {detalle ? <p className="text-sm text-muted-foreground">{detalle}</p> : null}
    </div>
  )
}
