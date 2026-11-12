import type { ReactNode } from "react"
import { Label } from "@/shared/ui/label"

interface CampoFormularioProps {
  id: string
  etiqueta: string
  error?: string
  ayuda?: string
  children: ReactNode
}

/**
 * Etiqueta siempre visible + control + mensaje de error. El control debe
 * recibir id={id}, aria-invalid y aria-describedby={idDescripcion(id)}.
 */
export function CampoFormulario({ id, etiqueta, error, ayuda, children }: CampoFormularioProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error ? (
        <p id={idDescripcion(id)} className="text-sm text-destructive">
          {error}
        </p>
      ) : ayuda ? (
        <p id={idDescripcion(id)} className="text-sm text-muted-foreground">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}

export function idDescripcion(id: string): string {
  return `${id}-descripcion`
}
