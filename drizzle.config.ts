import { existsSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

// drizzle-kit no carga .env.local por su cuenta.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local")
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/db/schema/index.ts",
  out: "./drizzle",
  // Solo se gestiona el esquema public; auth y los demás son de Supabase.
  schemaFilter: ["public"],
  dbCredentials: {
    // Pooler de sesión (5432) o conexión directa; el de transacciones no sirve para migrar.
    url: process.env.DATABASE_URL_MIGRACIONES ?? "",
  },
  strict: true,
  verbose: true,
})
