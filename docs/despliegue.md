# Despliegue en Vercel + Supabase

Pasos manuales para publicar la aplicación en producción. Aquí no se anotan valores secretos: cada variable se copia desde el panel de Supabase al de Vercel.

## Modelo de despliegue

- Solo la rama `main` se despliega, y siempre como **producción**.
- Las **vistas previas están desactivadas**. Vercel las ejecuta con `NODE_ENV=production`, así que también exigirían `URL_APP`, y cada vista previa tiene una URL distinta. Reactivarlas es un pendiente (ver `docs/pendientes.md`, Sprint 5).
- Desarrollo y producción usan **el mismo proyecto de Supabase**.
- Flujo de ramas: `feature/<tarea>` → `develop` (merge `--no-ff`, con el CI en verde) → `main` (merge `--no-ff`, con el CI en verde). Vercel despliega solo al recibir el push a `main`.

## Variables de entorno

| Variable | Dónde se obtiene | ¿En Vercel? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL | Sí |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → Publishable key | Sí |
| `DATABASE_URL` | Supabase → Connect → **Transaction pooler** (puerto 6543), con la contraseña de la base | Sí |
| `URL_APP` | La URL de producción de Vercel, con `https://` y **sin barra final** | Sí |
| `DATABASE_URL_MIGRACIONES` | Session pooler (puerto 5432) o conexión directa | **No**: solo la usa drizzle-kit en tu máquina |

Notas:

- Las variables `NEXT_PUBLIC_*` se incrustan **al compilar**. Si cambian, hay que volver a desplegar (Redeploy).
- Si falta una variable o es inválida, el servidor se niega a arrancar a propósito y **todas** las páginas dan error. El nombre de la variable aparece en Vercel → Deployments → (el despliegue) → Logs, con el texto `Variables de entorno inválidas o faltantes: ...`.
- El build no se conecta a la base ni necesita `URL_APP` ni `DATABASE_URL_MIGRACIONES`.

## 1. Base de datos (antes de cada despliegue con migraciones nuevas)

Desde tu máquina, en la rama que vas a desplegar:

```bash
npm run db:migrate
```

Aplica las migraciones pendientes de `drizzle/` en Supabase. Si ya están todas aplicadas, no hace nada. Las migraciones se aplican **antes** del push a `main`, para que el código nuevo no corra contra un esquema viejo.

## 2. Crear el proyecto en Vercel (una sola vez)

1. Vercel → **Add New… → Project** → importar el repositorio `sistema-prestamistas` de GitHub.
2. Framework Preset: **Next.js**. Root Directory: la raíz del repo. Build Command y Output: dejar los valores por defecto.
3. En **Environment Variables**, cargar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `DATABASE_URL`, marcando solo el entorno **Production**.
4. **Deploy**. El build termina bien, pero la app todavía no responde porque falta `URL_APP`.
5. Anotar el dominio de producción que asignó Vercel (Settings → Domains), por ejemplo `https://<proyecto>.vercel.app`.
6. Settings → Environment Variables → agregar `URL_APP` con ese dominio, sin barra final, solo en **Production**.
7. Deployments → último despliegue → **⋯ → Redeploy**.

## 3. Ajustes del proyecto en Vercel (una sola vez)

1. **Settings → Environments → Production → Branch Tracking**: rama `main` (es el valor por defecto).
2. **Settings → Git → Ignored Build Step**: elegir *Custom* y pegar este comando, que solo compila cuando la rama es `main`:

   ```bash
   [ "$VERCEL_GIT_COMMIT_REF" = "main" ] && exit 1 || exit 0
   ```

   En Vercel, `exit 0` significa "omitir el build" y `exit 1` significa "compilar". Los push a `develop` y a las ramas `feature/*` aparecerán como despliegues cancelados. Es lo esperado.
3. **Settings → Build and Deployment → Node.js Version**: **24.x**, la misma versión que usa el CI.

## 4. Supabase → Authentication → URL Configuration

1. **Site URL**: el mismo valor que `URL_APP`, es decir `https://<dominio-de-produccion>`.
2. **Redirect URLs**: agregar
   - `https://<dominio-de-produccion>/auth/confirm**`

   y **mantener** la entrada de desarrollo (`http://localhost:3000/auth/confirm**`), porque el proyecto de Supabase es el mismo.

La aplicación envía siempre `emailRedirectTo = <URL_APP>/auth/confirm?next=...` en producción y `<origen local>/auth/confirm?next=...` en desarrollo. Por eso los correos de cada entorno vuelven a su propia URL, siempre que esté en la lista de Redirect URLs. Si no está, Supabase usa la Site URL.

## 5. Verificación después del despliegue

En la URL de producción, desde el celular y en ancho de 375 px:

1. `/` redirige a `/login` si no hay sesión.
2. **Registro** (`/registro`): llega el correo, el enlace abre `<dominio>/auth/confirm`, termina en `/completar-registro` y se crea el negocio. El enlace debe abrirse **en el mismo navegador** donde te registraste (flujo PKCE de las plantillas por defecto).
3. **Login y logout.**
4. **Recuperar contraseña** (`/recuperar-contrasena`): el correo lleva a `/restablecer-contrasena`.
5. **Parte 2 del Sprint 1** (prueba pendiente): invitar a un ayudante desde Configuración → Usuarios, aceptar la invitación en otro navegador, cambiar de negocio con el selector y revisar que el ayudante solo vea lo permitido.
6. Revisar Vercel → Logs: no debe haber errores de variables de entorno ni de conexión a la base.

Si algo falla con los enlaces de los correos, revisar primero que `URL_APP`, la Site URL y las Redirect URLs usen exactamente el mismo dominio.
