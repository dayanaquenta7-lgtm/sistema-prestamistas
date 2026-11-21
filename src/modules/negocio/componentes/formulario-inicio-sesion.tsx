"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import type { AvisoLogin } from "@/shared/auth/confirmacion"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { iniciarSesion } from "../acciones/acceso"
import { esquemaInicioSesion, type DatosInicioSesion } from "../esquemas/acceso"

interface FormularioInicioSesionProps {
  avisoInicial?: AvisoLogin
  /** Destino tras iniciar sesión, ya validado en el servidor (por ejemplo, una invitación). */
  siguiente?: string
  /** Código de la invitación de la que viene, para ofrecer el registro sin negocio propio. */
  codigoInvitacion?: string
}

export function FormularioInicioSesion({ avisoInicial, siguiente, codigoInvitacion }: FormularioInicioSesionProps) {
  const { register, handleSubmit, setError, formState } = useForm<DatosInicioSesion>({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: { correo: "", contrasena: "" },
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(
    (datos: DatosInicioSesion) => iniciarSesion(datos, siguiente),
    setError,
  )
  const hrefRegistro = codigoInvitacion ? `/registro?invitacion=${codigoInvitacion}` : "/registro"
  const { errors } = formState

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
      {avisoInicial && !errorGeneral ? (
        <Aviso variante="error">
          <p>{avisoInicial.mensaje}</p>
          {avisoInicial.accion ? (
            <Link
              href={avisoInicial.accion.href}
              className="inline-flex min-h-11 items-center font-medium underline underline-offset-4"
            >
              {avisoInicial.accion.texto}
            </Link>
          ) : null}
        </Aviso>
      ) : null}
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

      <CampoFormulario id="contrasena" etiqueta="Contraseña" error={errors.contrasena?.message}>
        <Input
          id="contrasena"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.contrasena)}
          aria-describedby={idDescripcion("contrasena")}
          {...register("contrasena")}
        />
      </CampoFormulario>

      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? "Ingresando…" : "Ingresar"}
      </Button>

      <div className="flex flex-col gap-2 text-center text-sm">
        <Link href="/recuperar-contrasena" className="text-primary underline-offset-4 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <p className="text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href={hrefRegistro} className="text-primary underline-offset-4 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </form>
  )
}
