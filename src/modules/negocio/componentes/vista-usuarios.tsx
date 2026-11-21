import { connection } from "next/server"
import { requerirRol } from "@/shared/auth/sesion"
import { BotonAccion } from "@/shared/componentes/boton-accion"
import { EncabezadoPagina } from "@/shared/componentes/encabezado-pagina"
import { formatearFecha } from "@/shared/lib/fechas"
import { cn } from "@/shared/lib/utils"
import {
  cambiarActivoMembresia,
  cambiarPermisoMembresia,
  revocarInvitacion,
} from "../acciones/usuarios"
import { listarInvitacionesPendientes, listarMiembros, type Miembro } from "../consultas/usuarios"
import { MENSAJES_USUARIOS as M } from "../mensajes-invitacion"
import { GeneradorInvitacion } from "./generador-invitacion"

function Etiqueta({ children, tono }: { children: string; tono: "vigente" | "cancelado" | "neutro" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-sm whitespace-nowrap",
        tono === "vigente" && "border-estado-vigente/30 bg-estado-vigente-fondo text-estado-vigente-texto",
        tono === "cancelado" && "border-estado-cancelado/30 bg-estado-cancelado-fondo text-estado-cancelado-texto",
        tono === "neutro" && "border-border text-muted-foreground",
      )}
    >
      {children}
    </span>
  )
}

function FilaMiembro({ miembro, esUsuarioActual }: { miembro: Miembro; esUsuarioActual: boolean }) {
  const esDueno = miembro.rol === "dueno"
  return (
    <li className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="font-medium">
          {miembro.nombre}
          {esUsuarioActual ? <span className="font-normal text-muted-foreground"> (tú)</span> : null}
        </span>
        <div className="flex flex-wrap gap-2">
          <Etiqueta tono="neutro">{esDueno ? "Dueño" : "Ayudante"}</Etiqueta>
          <Etiqueta tono={miembro.activo ? "vigente" : "cancelado"}>{miembro.activo ? "Activo" : "Desactivado"}</Etiqueta>
          {esDueno ? null : (
            <Etiqueta tono="neutro">
              {miembro.puedeCrearPrestamos ? "Puede crear préstamos" : "No crea préstamos"}
            </Etiqueta>
          )}
        </div>
      </div>
      {/* El dueño no puede modificarse a sí mismo; el servidor también lo valida. */}
      {esDueno ? null : (
        <div className="flex flex-col gap-2 md:flex-row">
          <BotonAccion
            accion={cambiarPermisoMembresia.bind(null, miembro.membresiaId, !miembro.puedeCrearPrestamos)}
            texto={miembro.puedeCrearPrestamos ? "Quitar permiso de préstamos" : "Permitir crear préstamos"}
            mensajeExito={M.exitoPermiso}
          />
          {miembro.activo ? (
            <BotonAccion
              accion={cambiarActivoMembresia.bind(null, miembro.membresiaId, false)}
              texto="Desactivar"
              mensajeExito={M.exitoDesactivar}
              confirmacion={{
                pregunta: `¿Desactivar a ${miembro.nombre}? Perderá el acceso de inmediato.`,
                textoConfirmar: "Desactivar",
              }}
            />
          ) : (
            <BotonAccion
              accion={cambiarActivoMembresia.bind(null, miembro.membresiaId, true)}
              texto="Activar"
              mensajeExito={M.exitoActivar}
            />
          )}
        </div>
      )}
    </li>
  )
}

export async function VistaUsuarios() {
  const { negocio, usuario } = await requerirRol("dueno")
  await connection()
  const [miembros, pendientes] = await Promise.all([
    listarMiembros(negocio.id),
    listarInvitacionesPendientes(negocio.id, new Date()),
  ])

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Usuarios"
        descripcion="Invita ayudantes con un enlace y decide qué pueden hacer."
        migas={[{ titulo: "Configuración", href: "/configuracion" }, { titulo: "Usuarios" }]}
      />
      <div className="flex max-w-3xl flex-col gap-6">
        <section className="flex flex-col gap-3" aria-labelledby="titulo-miembros">
          <h2 id="titulo-miembros" className="text-base font-semibold">
            Miembros
          </h2>
          <ul className="flex flex-col divide-y rounded-md border">
            {miembros.map((miembro) => (
              <FilaMiembro key={miembro.membresiaId} miembro={miembro} esUsuarioActual={miembro.usuarioId === usuario.id} />
            ))}
          </ul>
        </section>

        <GeneradorInvitacion />

        <section className="flex flex-col gap-3" aria-labelledby="titulo-pendientes">
          <h2 id="titulo-pendientes" className="text-base font-semibold">
            Invitaciones pendientes
          </h2>
          {pendientes.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No hay invitaciones pendientes.
            </p>
          ) : (
            <ul className="flex flex-col divide-y rounded-md border">
              {pendientes.map((invitacion) => (
                <li key={invitacion.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">
                      Creada el {formatearFecha(invitacion.creadoEn, negocio.zonaHoraria)} · vence el{" "}
                      {formatearFecha(invitacion.venceEn, negocio.zonaHoraria)}
                    </span>
                    <span className="text-muted-foreground">
                      {invitacion.puedeCrearPrestamos ? "Con permiso de crear préstamos" : "Sin permiso de crear préstamos"}
                    </span>
                  </div>
                  <BotonAccion
                    accion={revocarInvitacion.bind(null, invitacion.id)}
                    texto="Revocar"
                    mensajeExito={M.exitoRevocar}
                    confirmacion={{ pregunta: "¿Revocar esta invitación? El enlace dejará de funcionar.", textoConfirmar: "Revocar" }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
