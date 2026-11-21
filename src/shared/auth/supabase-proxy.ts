import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { RUTA_LOGIN, esRutaPublica } from "./rutas"

/**
 * Renueva la sesión de Supabase en cada solicitud y hace una verificación
 * optimista: sin sesión, las rutas privadas van a /login. La autorización real
 * (negocio y rol) se valida en el servidor con los helpers de sesion.ts.
 */
export async function actualizarSesion(solicitud: NextRequest): Promise<NextResponse> {
  let respuesta = NextResponse.next({ request: solicitud })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !clave) {
    throw new Error("Faltan las variables públicas de Supabase")
  }

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll() {
        return solicitud.cookies.getAll()
      },
      setAll(cookiesPorGuardar, encabezados) {
        for (const { name, value } of cookiesPorGuardar) {
          solicitud.cookies.set(name, value)
        }
        respuesta = NextResponse.next({ request: solicitud })
        for (const { name, value, options } of cookiesPorGuardar) {
          respuesta.cookies.set(name, value, options)
        }
        for (const [clave, valor] of Object.entries(encabezados)) {
          respuesta.headers.set(clave, valor)
        }
      },
    },
  })

  // getClaims valida el JWT y renueva la sesión si está por vencer.
  const { data } = await supabase.auth.getClaims()
  const haySesion = Boolean(data?.claims)

  if (!haySesion && !esRutaPublica(solicitud.nextUrl.pathname)) {
    const destino = solicitud.nextUrl.clone()
    destino.pathname = RUTA_LOGIN
    destino.search = ""
    const redireccion = NextResponse.redirect(destino)
    for (const cookie of respuesta.cookies.getAll()) {
      redireccion.cookies.set(cookie)
    }
    return redireccion
  }

  return respuesta
}
