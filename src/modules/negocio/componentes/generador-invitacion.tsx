"use client"

import { Check, Copy, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Aviso } from "@/shared/componentes/aviso"
import { Casilla } from "@/shared/componentes/casilla"
import { Button, buttonVariants } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { crearInvitacion, type InvitacionGenerada } from "../acciones/usuarios"

function textoWhatsApp({ enlace, venceEl, negocio }: InvitacionGenerada): string {
  return `Hola, te invito a unirte como ayudante a «${negocio}» en el sistema de préstamos. Abre este enlace para crear tu cuenta o iniciar sesión (vence el ${venceEl}): ${enlace}`
}

export function GeneradorInvitacion() {
  const router = useRouter()
  const [puedeCrearPrestamos, setPuedeCrearPrestamos] = useState(false)
  const [generada, setGenerada] = useState<InvitacionGenerada | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [enviando, iniciarTransicion] = useTransition()

  function generar() {
    setError(null)
    iniciarTransicion(async () => {
      const resultado = await crearInvitacion({ puedeCrearPrestamos })
      if (!resultado.ok) {
        setError(resultado.error)
        return
      }
      setGenerada(resultado.datos)
      setCopiado(false)
      router.refresh()
    })
  }

  async function copiar(enlace: string) {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
      toast.success("Enlace copiado.")
    } catch {
      toast.error("No pudimos copiar el enlace. Selecciónalo y cópialo a mano.")
    }
  }

  if (generada) {
    return (
      <div className="flex flex-col gap-4 rounded-md border p-4">
        <h2 className="text-base font-semibold">Enlace de invitación</h2>
        <Aviso variante="informacion">
          Este enlace se muestra <strong className="font-medium">una sola vez</strong>. Sirve para una sola persona y
          vence el {generada.venceEl}.
        </Aviso>
        <Input
          readOnly
          value={generada.enlace}
          aria-label="Enlace de invitación"
          onFocus={(evento) => evento.currentTarget.select()}
          className="font-mono text-sm"
        />
        <div className="flex flex-col gap-2 md:flex-row">
          <Button type="button" onClick={() => copiar(generada.enlace)}>
            {copiado ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copiado ? "Copiado" : "Copiar"}
          </Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(textoWhatsApp(generada))}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <MessageCircle aria-hidden="true" />
            Compartir por WhatsApp
          </a>
          <Button type="button" variant="ghost" onClick={() => setGenerada(null)} className="md:ml-auto">
            Generar otro enlace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <h2 className="text-base font-semibold">Invitar a un ayudante</h2>
      <p className="text-sm text-muted-foreground">
        Genera un enlace y compártelo por WhatsApp u otro medio. Sirve una sola vez y vence a los 7 días.
      </p>
      {error ? <Aviso variante="error">{error}</Aviso> : null}
      <Casilla
        id="invitacion-puede-crear-prestamos"
        etiqueta="Puede crear préstamos"
        descripcion="Puedes cambiarlo después."
        checked={puedeCrearPrestamos}
        onChange={(evento) => setPuedeCrearPrestamos(evento.target.checked)}
      />
      <Button type="button" onClick={generar} disabled={enviando} className="md:self-start">
        {enviando ? "Generando…" : "Generar enlace"}
      </Button>
    </div>
  )
}
