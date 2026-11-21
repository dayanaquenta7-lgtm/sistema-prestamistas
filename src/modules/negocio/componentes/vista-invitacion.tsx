import Link from "next/link"
import { connection } from "next/server"
import type { ReactNode } from "react"
import { esCodigoInvitacion, RUTA_INICIO_PANEL, rutaInvitacion } from "@/shared/auth/rutas"
import { leerUsuario, type UsuarioSesion } from "@/shared/auth/sesion"
import { Aviso } from "@/shared/componentes/aviso"
import { buttonVariants } from "@/shared/ui/button"
import { estaPendiente, evaluarInvitacion } from "../dominio/invitaciones"
import { buscarInvitacion, membresiaEnNegocio, tienePerfil } from "../consultas/usuarios"
import { MENSAJE_INVITACION_NO_DISPONIBLE, MENSAJES_USUARIOS as M } from "../mensajes-invitacion"
import { BotonCerrarSesion } from "./boton-cerrar-sesion"
import { BotonEntrarNegocio } from "./selector-negocio"
import { FormularioAceptarInvitacion } from "./formulario-aceptar-invitacion"
import { TarjetaAcceso } from "./tarjeta-acceso"

function PieSesion({ usuario }: { usuario: UsuarioSesion }) {
  return (
    <div className="mt-6 flex flex-col gap-2 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Sesión iniciada como <span className="font-medium text-foreground">{usuario.correo}</span>.
      </p>
      <BotonCerrarSesion variante="ghost" className="w-full" />
    </div>
  )
}

function Tarjeta({ titulo, usuario, children }: { titulo: string; usuario: UsuarioSesion | null; children: ReactNode }) {
  return (
    <TarjetaAcceso titulo={titulo}>
      {children}
      {usuario ? <PieSesion usuario={usuario} /> : null}
    </TarjetaAcceso>
  )
}

function NoDisponible({ usuario }: { usuario: UsuarioSesion | null }) {
  return (
    <Tarjeta titulo="Invitación no disponible" usuario={usuario}>
      <Aviso variante="informacion">{MENSAJE_INVITACION_NO_DISPONIBLE}</Aviso>
    </Tarjeta>
  )
}

/** /invitacion/[codigo]: pública. Sin sesión ofrece registrarse o iniciar sesión y vuelve aquí. */
export async function VistaInvitacion({ codigo }: { codigo: string }) {
  const usuario = await leerUsuario()
  await connection()
  const invitacion = esCodigoInvitacion(codigo) ? await buscarInvitacion(codigo) : null
  const ahora = new Date()

  if (!usuario) {
    if (!invitacion || !estaPendiente(invitacion, ahora)) return <NoDisponible usuario={null} />
    const siguiente = encodeURIComponent(rutaInvitacion(codigo))
    return (
      <Tarjeta titulo="Te invitaron a un negocio" usuario={null}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Para unirte como ayudante, crea tu cuenta o inicia sesión si ya tienes una. Después volverás a esta
            invitación.
          </p>
          <Link href={`/registro?invitacion=${codigo}`} className={buttonVariants({ className: "w-full" })}>
            Crear cuenta
          </Link>
          <Link href={`/login?siguiente=${siguiente}`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
            Ya tengo cuenta: iniciar sesión
          </Link>
        </div>
      </Tarjeta>
    )
  }

  if (!invitacion) return <NoDisponible usuario={usuario} />

  const membresia = await membresiaEnNegocio(usuario.id, invitacion.negocioId)
  const resultado = evaluarInvitacion({
    invitacion,
    ahora,
    esDueno: membresia?.rol === "dueno",
    membresia,
  })

  switch (resultado) {
    case "no_disponible":
      return <NoDisponible usuario={usuario} />
    case "es_dueno":
      return (
        <Tarjeta titulo="Es tu propio enlace" usuario={usuario}>
          <div className="flex flex-col gap-4">
            <Aviso variante="informacion">{M.esDueno}</Aviso>
            <Link href="/configuracion/usuarios" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              Ir a Usuarios
            </Link>
          </div>
        </Tarjeta>
      )
    case "ya_miembro_activo":
      return (
        <Tarjeta titulo={invitacion.negocioNombre} usuario={usuario}>
          <div className="flex flex-col gap-4">
            <Aviso variante="informacion">{M.yaMiembroActivo}</Aviso>
            <BotonEntrarNegocio negocioId={invitacion.negocioId} nombre={invitacion.negocioNombre} />
          </div>
        </Tarjeta>
      )
    case "ya_miembro_inactivo":
      return (
        <Tarjeta titulo={invitacion.negocioNombre} usuario={usuario}>
          <Aviso variante="informacion">{M.yaMiembroInactivo}</Aviso>
          <Link href={RUTA_INICIO_PANEL} className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}>
            Ir al inicio
          </Link>
        </Tarjeta>
      )
    case "valida": {
      const pedirNombre = !(await tienePerfil(usuario.id))
      return (
        <Tarjeta titulo={`Unirte a ${invitacion.negocioNombre}`} usuario={usuario}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Te invitaron como ayudante de <span className="font-medium text-foreground">{invitacion.negocioNombre}</span>.
              Podrás registrar clientes y cobros; el dueño decide el resto de tus permisos.
            </p>
            <FormularioAceptarInvitacion codigo={codigo} pedirNombre={pedirNombre} nombreInicial={usuario.metadatos.nombre} />
          </div>
        </Tarjeta>
      )
    }
  }
}
