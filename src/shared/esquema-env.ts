import { z } from "zod"

export const esquemaEnv = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    // Origen de los enlaces de los correos de Supabase. En producción es obligatoria para no
    // construirlos con un origen tomado de los encabezados de la solicitud.
    URL_APP: z
      .url({ protocol: /^https?$/ })
      .transform((url) => url.replace(/\/+$/, ""))
      .optional(),
  })
  .superRefine((datos, contexto) => {
    if (datos.NODE_ENV === "production" && !datos.URL_APP) {
      contexto.addIssue({ code: "custom", path: ["URL_APP"], message: "Obligatoria en producción" })
    }
  })

export type Env = z.infer<typeof esquemaEnv>
