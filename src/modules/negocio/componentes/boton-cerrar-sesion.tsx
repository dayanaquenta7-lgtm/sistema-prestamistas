import { LogOut } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { cerrarSesion } from "../acciones/acceso"

interface BotonCerrarSesionProps {
  variante?: "outline" | "ghost"
  className?: string
}

export function BotonCerrarSesion({ variante = "outline", className }: BotonCerrarSesionProps) {
  return (
    <form action={cerrarSesion}>
      <Button type="submit" variant={variante} className={className}>
        <LogOut aria-hidden="true" />
        Cerrar sesión
      </Button>
    </form>
  )
}
