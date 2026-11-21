import { z } from "zod"

const correo = z.string().trim().toLowerCase().pipe(z.email("Ingresa un correo válido"))

const contrasenaNueva = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede tener más de 72 caracteres")

const nombrePersona = z
  .string()
  .trim()
  .min(2, "Ingresa tu nombre")
  .max(120, "El nombre es demasiado largo")

const nombreNegocio = z
  .string()
  .trim()
  .min(2, "Ingresa el nombre del negocio")
  .max(120, "El nombre del negocio es demasiado largo")

function conConfirmacion<T extends z.ZodObject<{ contrasena: z.ZodString; confirmacion: z.ZodString }>>(
  esquema: T,
) {
  return esquema.refine((datos) => datos.contrasena === datos.confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacion"],
  })
}

export const esquemaInicioSesion = z.object({
  correo,
  contrasena: z.string().min(1, "Ingresa tu contraseña"),
})

export const esquemaRegistro = conConfirmacion(
  z.object({
    nombre: nombrePersona,
    nombreNegocio,
    correo,
    contrasena: contrasenaNueva,
    confirmacion: z.string(),
  }),
)

/** Registro desde un enlace de invitación: sin negocio, porque se une a uno existente como ayudante. */
export const esquemaRegistroInvitado = conConfirmacion(
  z.object({
    nombre: nombrePersona,
    correo,
    contrasena: contrasenaNueva,
    confirmacion: z.string(),
  }),
)

/** Nombre que se pide al aceptar una invitación si el usuario aún no tiene perfil. */
export const esquemaAceptarInvitacion = z.object({ nombre: z.string() })
export const esquemaNombrePerfil = z.object({ nombre: nombrePersona })

export const esquemaCompletarRegistro = z.object({
  nombre: nombrePersona,
  nombreNegocio,
})

export const esquemaRecuperarContrasena = z.object({ correo })

export const esquemaReenviarConfirmacion = z.object({ correo })

export const esquemaRestablecerContrasena = conConfirmacion(
  z.object({
    contrasena: contrasenaNueva,
    confirmacion: z.string(),
  }),
)

export type DatosInicioSesion = z.infer<typeof esquemaInicioSesion>
export type DatosRegistro = z.infer<typeof esquemaRegistro>
export type DatosRegistroInvitado = z.infer<typeof esquemaRegistroInvitado>
export type DatosAceptarInvitacion = z.infer<typeof esquemaAceptarInvitacion>
export type DatosCompletarRegistro = z.infer<typeof esquemaCompletarRegistro>
export type DatosRecuperarContrasena = z.infer<typeof esquemaRecuperarContrasena>
export type DatosReenviarConfirmacion = z.infer<typeof esquemaReenviarConfirmacion>
export type DatosRestablecerContrasena = z.infer<typeof esquemaRestablecerContrasena>
