import { redirect } from "next/navigation"
import { RUTA_INICIO_PANEL } from "@/shared/auth/rutas"

export default function PaginaRaiz() {
  redirect(RUTA_INICIO_PANEL)
}
