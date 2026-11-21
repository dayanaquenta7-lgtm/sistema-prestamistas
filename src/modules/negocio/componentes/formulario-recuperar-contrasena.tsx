"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { recuperarContrasena } from "../acciones/acceso"
import { esquemaRecuperarContrasena, type DatosRecuperarContrasena } from "../esquemas/acceso"

export function FormularioRecuperarContrasena() {
  const { register, handleSubmit, setError, formState } = useForm<DatosRecuperarContrasena>({
    resolver: zodResolver(esquemaRecuperarContrasena),
    defaultValues: { correo: "" },
  })
  const { enviar, enviando, errorGeneral, exitoso } = useEnvioFormulario(recuperarContrasena, setError)
  const { errors } = formState

  if (exitoso) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso variante="exito">
          Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña.
        </Aviso>
        <Link href="/login" className="text-center text-sm text-primary underline-offset-4 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}

      <CampoFormulario id="correo" etiqueta="Correo" error={errors.correo?.message}>
        <Input
          id="correo"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.correo)}
          aria-describedby={idDescripcion("correo")}
          {...register("correo")}
        />
      </CampoFormulario>

      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? "Enviando…" : "Enviar enlace"}
      </Button>

      <Link href="/login" className="text-center text-sm text-primary underline-offset-4 hover:underline">
        Volver a iniciar sesión
      </Link>
    </form>
  )
}
