import { Suspense, type ReactNode } from "react"
import { listarNegociosDisponibles, obtenerContexto } from "@/shared/auth/sesion"
import { NavegacionPanel } from "@/shared/navegacion/navegacion-panel"
import { seccionesVisibles } from "@/shared/navegacion/secciones"
import { BotonCerrarSesion } from "@/modules/negocio/componentes/boton-cerrar-sesion"
import { SelectorNegocio } from "@/modules/negocio/componentes/selector-negocio"

// La sesión se lee dentro de un Suspense y no en el nivel superior del layout
// (Cache Components): así el resto del panel no espera a la solicitud.
async function NavegacionConSesion() {
  const { negocio, rol, usuario } = await obtenerContexto()
  const negocios = await listarNegociosDisponibles(usuario.id)
  const nombreUsuario = usuario.metadatos.nombre || usuario.correo
  return (
    <NavegacionPanel
      secciones={seccionesVisibles(rol)}
      nombreNegocio={negocio.nombre}
      nombreUsuario={nombreUsuario}
      selectorNegocio={
        negocios.length > 1 ? (
          <SelectorNegocio actual={negocio} negocios={negocios} nombreUsuario={nombreUsuario} />
        ) : undefined
      }
      pie={<BotonCerrarSesion variante="ghost" className="w-full justify-start" />}
    />
  )
}

function EsqueletoNavegacion() {
  return <div className="hidden h-dvh w-60 shrink-0 border-r bg-sidebar md:block" aria-hidden="true" />
}

export default function LayoutPanel({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:flex">
      <Suspense fallback={<EsqueletoNavegacion />}>
        <NavegacionConSesion />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
