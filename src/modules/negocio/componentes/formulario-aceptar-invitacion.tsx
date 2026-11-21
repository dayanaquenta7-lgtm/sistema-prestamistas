"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { aceptarInvitacion } from "../acciones/invitaciones"
import { esquemaAceptarInvitacion, esquemaNombrePerfil, type DatosAceptarInvitacion } from "../esquemas/acceso"

interface FormularioAceptarInvitacionProps {
  codigo: string
  /** Si el usuario aún no tiene perfil, se le pide su nombre. */
  pedirNombre: boolean
  nombreInicial: string
}

export function FormularioAceptarInvitacion({ codigo, pedirNombre, nombreInicial }: FormularioAceptarInvitacionProps) {
  const { register, handleSubmit, setError, formState } = useForm<DatosAceptarInvitacion>({
    resolver: zodResolver(pedirNombre ? esquemaNombrePerfil : esquemaAceptarInvitacion),
    defaultValues: { nombre: nombreInicial },
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(
    (datos: DatosAceptarInvitacion) => aceptarInvitacion(codigo, datos),
    setError,
  )
  const error = formState.errors.nombre?.message

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}
      {pedirNombre ? (
        <CampoFormulario id="nombre" etiqueta="Tu nombre" error={error} ayuda="Así te verá el dueño del negocio.">
          <Input
            id="nombre"
            autoComplete="name"
            aria-invalid={Boolean(error)}
            aria-describedby={idDescripcion("nombre")}
            {...register("nombre")}
          />
        </CampoFormulario>
      ) : null}
      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? "Uniéndote…" : "Unirme como ayudante"}
      </Button>
    </form>
  )
}
