import { CalendarDays, ChevronLeft, ChevronRight, ChevronRightIcon, FileStack, Scale, SlidersHorizontal, Store, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { aEntradaFormulario, CONDICIONES_INICIALES } from "@/modules/prestamos"
import { requerirRol } from "@/shared/auth/sesion"
import { Aviso } from "@/shared/componentes/aviso"
import { BotonAccion } from "@/shared/componentes/boton-accion"
import { EncabezadoPagina, type Miga } from "@/shared/componentes/encabezado-pagina"
import { formatearFecha, hoyEnZona } from "@/shared/lib/fechas"
import { formatearTasa } from "@/shared/lib/tasas"
import { cn } from "@/shared/lib/utils"
import { buttonVariants } from "@/shared/ui/button"
import { quitarFeriado } from "../acciones/feriados"
import { guardarCondicionesDefecto } from "../acciones/negocio"
import { cambiarEstadoPlantilla, crearPlantilla, editarPlantilla } from "../acciones/plantillas"
import {
  listarFeriados,
  listarPlantillas,
  obtenerConfiguracionNegocio,
  obtenerPlantilla,
} from "../consultas/configuracion"
import { anioDeParametro, esquemaId, MENSAJES_CONFIGURACION as M } from "../esquemas/configuracion"
import { FormularioCondiciones } from "./formulario-condiciones"
import { FormularioFeriado } from "./formulario-feriado"
import { FormularioDatosNegocio, FormularioTope } from "./formularios-negocio"

const MIGA_CONFIGURACION: Miga = { titulo: "Configuración", href: "/configuracion" }

interface Apartado {
  href: string
  titulo: string
  descripcion: string
  icono: typeof Store
}

const APARTADOS: Apartado[] = [
  { href: "/configuracion/negocio", titulo: "Negocio y tope legal", descripcion: "Nombre del negocio y tasa mensual de la alerta legal.", icono: Store },
  { href: "/configuracion/condiciones", titulo: "Condiciones por defecto", descripcion: "Se usan para precargar las plantillas nuevas.", icono: SlidersHorizontal },
  { href: "/configuracion/plantillas", titulo: "Plantillas de préstamo", descripcion: "Condiciones listas para usar al prestar.", icono: FileStack },
  { href: "/configuracion/feriados", titulo: "Feriados", descripcion: "Días en que no se cobra, si la plantilla lo indica.", icono: CalendarDays },
  { href: "/configuracion/usuarios", titulo: "Usuarios", descripcion: "Ayudantes, permisos e invitaciones.", icono: Users },
]

export function VistaIndiceConfiguracion() {
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina titulo="Configuración" descripcion="Solo el dueño del negocio puede ver y cambiar esta sección." />
      <ul className="grid gap-3 md:grid-cols-2">
        {APARTADOS.map(({ href, titulo, descripcion, icono: Icono }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-16 items-center gap-3 rounded-md border p-4 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Icono className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{titulo}</span>
                <span className="text-sm text-muted-foreground">{descripcion}</span>
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Tarjeta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-md border p-4 md:p-6">
      <h2 className="text-base font-semibold">{titulo}</h2>
      {children}
    </section>
  )
}

export async function VistaNegocio() {
  const { negocio } = await requerirRol("dueno")
  const configuracion = await obtenerConfiguracionNegocio(negocio.id)
  if (!configuracion) notFound()

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina titulo="Negocio y tope legal" migas={[MIGA_CONFIGURACION, { titulo: "Negocio" }]} />
      <div className="flex max-w-2xl flex-col gap-6">
        <Tarjeta titulo="Datos del negocio">
          <FormularioDatosNegocio nombre={configuracion.nombre} />
          <dl className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Moneda</dt>
              <dd className="font-medium">Bolivianos ({configuracion.moneda})</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Zona horaria</dt>
              <dd className="font-medium">{configuracion.zonaHoraria}</dd>
            </div>
          </dl>
        </Tarjeta>
        <Tarjeta titulo="Tope legal">
          <div className="flex gap-2 text-sm text-muted-foreground">
            <Scale className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              Es una advertencia, no un bloqueo: si un préstamo supera este tope, el sistema te avisa, te pide
              confirmar y lo registra en la auditoría. Referencia: art. 409 del Código Civil.
            </p>
          </div>
          <FormularioTope tope={formatearTasa(configuracion.topeTasaMensual)} />
        </Tarjeta>
      </div>
    </div>
  )
}

export async function VistaCondicionesDefecto() {
  const { negocio } = await requerirRol("dueno")
  const configuracion = await obtenerConfiguracionNegocio(negocio.id)
  if (!configuracion) notFound()

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Condiciones por defecto"
        migas={[MIGA_CONFIGURACION, { titulo: "Condiciones por defecto" }]}
      />
      {configuracion.condicionesDefecto ? null : (
        <Aviso variante="informacion" className="max-w-2xl">
          Todavía no guardaste condiciones por defecto. Te proponemos estas; ajústalas y guárdalas.
        </Aviso>
      )}
      <FormularioCondiciones
        modo="defecto"
        valoresIniciales={{
          nombre: "",
          condiciones: aEntradaFormulario(configuracion.condicionesDefecto ?? CONDICIONES_INICIALES),
        }}
        accion={guardarCondicionesDefecto}
      />
    </div>
  )
}

export async function VistaPlantillas() {
  const { negocio } = await requerirRol("dueno")
  const plantillas = await listarPlantillas(negocio.id)

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Plantillas de préstamo"
        descripcion="Editar o desactivar una plantilla no cambia los préstamos ya creados."
        migas={[MIGA_CONFIGURACION, { titulo: "Plantillas" }]}
        acciones={
          <Link href="/configuracion/plantillas/nueva" className={buttonVariants()}>
            Nueva plantilla
          </Link>
        }
      />
      {plantillas.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-dashed p-6">
          <p className="font-medium">Todavía no tienes plantillas.</p>
          <p className="text-sm text-muted-foreground">
            Crea una con las condiciones que más usas, por ejemplo «Diario 24 días».
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y rounded-md border">
          {plantillas.map((plantilla) => (
            <li key={plantilla.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("font-medium", !plantilla.activa && "text-muted-foreground")}>
                    {plantilla.nombre}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-sm",
                      plantilla.activa
                        ? "border-estado-vigente/30 bg-estado-vigente-fondo text-estado-vigente-texto"
                        : "border-estado-cancelado/30 bg-estado-cancelado-fondo text-estado-cancelado-texto",
                    )}
                  >
                    {plantilla.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{plantilla.resumen}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/configuracion/plantillas/${plantilla.id}/editar`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Editar
                </Link>
                <BotonAccion
                  accion={cambiarEstadoPlantilla.bind(null, plantilla.id, !plantilla.activa)}
                  texto={plantilla.activa ? "Desactivar" : "Activar"}
                  mensajeExito={plantilla.activa ? M.exitoDesactivar : M.exitoActivar}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const MIGA_PLANTILLAS: Miga = { titulo: "Plantillas", href: "/configuracion/plantillas" }

export async function VistaNuevaPlantilla() {
  const { negocio } = await requerirRol("dueno")
  const configuracion = await obtenerConfiguracionNegocio(negocio.id)
  const condiciones = configuracion?.condicionesDefecto ?? CONDICIONES_INICIALES

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Nueva plantilla"
        descripcion="Precargada con las condiciones por defecto del negocio."
        migas={[MIGA_CONFIGURACION, MIGA_PLANTILLAS, { titulo: "Nueva" }]}
      />
      <FormularioCondiciones
        modo="crear-plantilla"
        valoresIniciales={{ nombre: "", condiciones: aEntradaFormulario(condiciones) }}
        accion={crearPlantilla}
        hrefCancelar="/configuracion/plantillas"
      />
    </div>
  )
}

export async function VistaEditarPlantilla({ id }: { id: string }) {
  const idValido = esquemaId.safeParse(id)
  if (!idValido.success) notFound()
  const { negocio } = await requerirRol("dueno")
  const plantilla = await obtenerPlantilla(negocio.id, idValido.data)
  if (!plantilla) notFound()

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Editar plantilla"
        migas={[MIGA_CONFIGURACION, MIGA_PLANTILLAS, { titulo: plantilla.nombre }]}
      />
      {plantilla.condiciones ? null : (
        <Aviso variante="error" className="max-w-2xl">
          Las condiciones guardadas de esta plantilla no son válidas. Revísalas y vuelve a guardarlas.
        </Aviso>
      )}
      <FormularioCondiciones
        modo="editar-plantilla"
        valoresIniciales={{
          nombre: plantilla.nombre,
          condiciones: aEntradaFormulario(plantilla.condiciones ?? CONDICIONES_INICIALES),
        }}
        accion={editarPlantilla.bind(null, plantilla.id)}
        hrefCancelar="/configuracion/plantillas"
      />
    </div>
  )
}

export async function VistaFeriados({ anio: parametro }: { anio: string | string[] | undefined }) {
  const { negocio } = await requerirRol("dueno")
  const anioActual = Number.parseInt(hoyEnZona(negocio.zonaHoraria).slice(0, 4), 10)
  const anio = anioDeParametro(parametro, anioActual)
  const lista = await listarFeriados(negocio.id, anio)

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Feriados"
        descripcion="Quitar un feriado no cambia los préstamos ya creados."
        migas={[MIGA_CONFIGURACION, { titulo: "Feriados" }]}
      />
      <div className="flex max-w-2xl flex-col gap-6">
        <nav aria-label="Año" className="flex items-center justify-between gap-2">
          <Link
            href={`/configuracion/feriados?anio=${anio - 1}`}
            className={buttonVariants({ variant: "outline" })}
            aria-label={`Año ${anio - 1}`}
          >
            <ChevronLeft aria-hidden="true" /> {anio - 1}
          </Link>
          <h2 className="text-lg font-semibold tabular-nums">{anio}</h2>
          <Link
            href={`/configuracion/feriados?anio=${anio + 1}`}
            className={buttonVariants({ variant: "outline" })}
            aria-label={`Año ${anio + 1}`}
          >
            {anio + 1} <ChevronRight aria-hidden="true" />
          </Link>
        </nav>

        {lista.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            No hay feriados registrados en {anio}.
          </p>
        ) : (
          <ul className="flex flex-col divide-y rounded-md border">
            {lista.map((feriado) => (
              <li key={feriado.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col">
                  <span className="font-medium tabular-nums">{formatearFecha(feriado.fecha)}</span>
                  <span className="text-sm text-muted-foreground">{feriado.descripcion}</span>
                </div>
                <BotonAccion
                  accion={quitarFeriado.bind(null, feriado.id)}
                  texto="Quitar"
                  mensajeExito={M.exitoQuitarFeriado}
                  confirmacion={{ pregunta: `¿Quitar el feriado del ${formatearFecha(feriado.fecha)}?`, textoConfirmar: "Quitar" }}
                />
              </li>
            ))}
          </ul>
        )}

        <FormularioFeriado anio={anio} />
      </div>
    </div>
  )
}
