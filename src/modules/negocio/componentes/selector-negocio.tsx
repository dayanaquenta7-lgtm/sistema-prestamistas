"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import type { NegocioDisponible } from "@/shared/auth/sesion"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { cambiarNegocio } from "../acciones/seleccion"

function useCambiarNegocio() {
  const [cambiando, iniciarTransicion] = useTransition()
  function cambiar(negocioId: string) {
    iniciarTransicion(async () => {
      // Si termina bien, la acción redirige a "Cobrar hoy" con el negocio nuevo.
      const resultado = await cambiarNegocio(negocioId)
      if (!resultado.ok) toast.error(resultado.error)
    })
  }
  return { cambiar, cambiando }
}

interface SelectorNegocioProps {
  actual: { id: string; nombre: string }
  negocios: NegocioDisponible[]
  nombreUsuario: string
}

/** Solo se muestra si el usuario tiene más de una membresía activa. */
export function SelectorNegocio({ actual, negocios, nombreUsuario }: SelectorNegocioProps) {
  const { cambiar, cambiando } = useCambiarNegocio()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        disabled={cambiando}
        aria-label={`Negocio actual: ${actual.nombre}. Cambiar de negocio`}
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold">{cambiando ? "Cambiando…" : actual.nombre}</span>
          <span className="truncate text-sm font-normal text-muted-foreground">{nombreUsuario}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Cambiar de negocio</DropdownMenuLabel>
          {negocios.map((negocio) => (
            <DropdownMenuItem
              key={negocio.id}
              className="min-h-11"
              onClick={() => (negocio.id === actual.id ? undefined : cambiar(negocio.id))}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{negocio.nombre}</span>
                <span className="text-xs text-muted-foreground">{negocio.rol === "dueno" ? "Dueño" : "Ayudante"}</span>
              </span>
              {negocio.id === actual.id ? <Check aria-label="Negocio actual" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Entra a un negocio del que el usuario ya es miembro (por ejemplo, desde una invitación). */
export function BotonEntrarNegocio({ negocioId, nombre }: { negocioId: string; nombre: string }) {
  const { cambiar, cambiando } = useCambiarNegocio()
  return (
    <Button type="button" className="w-full" disabled={cambiando} onClick={() => cambiar(negocioId)}>
      {cambiando ? "Entrando…" : `Ir a ${nombre}`}
    </Button>
  )
}
