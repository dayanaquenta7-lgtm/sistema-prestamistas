import { redirect } from "next/navigation"
import { Aviso } from "@/shared/componentes/aviso"
import { RUTA_INICIO_PANEL } from "@/shared/auth/rutas"
import { estadoMembresia, obtenerUsuario } from "@/shared/auth/sesion"
import { BotonCerrarSesion } from "./boton-cerrar-sesion"
import { FormularioCompletarRegistro } from "./formulario-completar-registro"
import { TarjetaAcceso } from "./tarjeta-acceso"

/**
 * Destino de todo usuario con sesión y sin membresía activa. La única salida
 * es cerrar sesión: no hay enlaces hacia otras pantallas.
 */
export async function VistaCompletarRegistro() {
  const usuario = await obtenerUsuario()
  const estado = await estadoMembresia(usuario.id)

  if (estado === "activa") redirect(RUTA_INICIO_PANEL)

  if (estado === "inactiva") {
    return (
      <TarjetaAcceso titulo="Acceso desactivado">
        <div className="flex flex-col gap-4">
          <Aviso variante="informacion">
            Tu acceso al negocio fue desactivado. Si crees que es un error, comunícate con el dueño del
            negocio.
          </Aviso>
          <BotonCerrarSesion className="w-full" />
        </div>
      </TarjetaAcceso>
    )
  }

  return (
    <TarjetaAcceso
      titulo="Completa tu registro"
      descripcion={`Confirmaste el correo ${usuario.correo}. Revisa los datos y crea tu negocio.`}
    >
      <div className="flex flex-col gap-4">
        <FormularioCompletarRegistro
          valoresIniciales={{
            nombre: usuario.metadatos.nombre,
            nombreNegocio: usuario.metadatos.nombreNegocio,
          }}
        />
        <BotonCerrarSesion variante="ghost" className="w-full" />
      </div>
    </TarjetaAcceso>
  )
}
