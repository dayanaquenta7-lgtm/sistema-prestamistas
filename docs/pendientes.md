# Pendientes

Decisiones y tareas aplazadas, ordenadas por el sprint en que deben resolverse. Al cerrar un pendiente, eliminarlo de esta lista y mencionarlo en el commit correspondiente.

## Sprint 1 — Configuración y clientes

- Foto del cliente en Supabase Storage (docs/alcance.md, 2.2). Quedó fuera de la parte 1: crear el bucket con acceso restringido por negocio y asignarla a la parte 2 o a un sprint posterior.
- Búsqueda de clientes sin distinguir tildes ("Pérez" = "Perez"): requiere la extensión `unaccent` y una migración que la cree.

## Sprint 2 — Motor de cálculo

- El Simulador muestra la ganancia; el ayudante no puede ver ganancias. Definir cómo se presenta el Simulador para ese rol.
- Esquema de condiciones de snapshot (RN-01) sobre el de plantilla (`src/modules/prestamos/esquemas/condiciones.ts`): con método `monto_fijo` exige el interés fijo en Bs, que se escribe en el simulador o al crear el préstamo. La plantilla y las condiciones por defecto no guardan ese valor.

## Sprint 3 — Préstamos

- Definir el período de la tasa preferencial del cliente al implementar la cascada de condiciones (docs/alcance.md, sección 3). Propuesta: se interpreta en el período de la tasa de la plantilla elegida.
- Calcular el estado del cliente (sin préstamos, al día, en mora) y el total adeudado con los préstamos reales: hoy `estadosPrestamos()` devuelve una lista vacía y el total es Bs 0,00 (src/modules/clientes/consultas/clientes.ts).
- Mostrar en la ficha del cliente sus préstamos vigentes e históricos.
- Avisar al crear un préstamo para un cliente marcado como no prestar.
- Exigir `puede_crear_prestamos` del ayudante (ya disponible en `obtenerContexto`) en la pantalla y la acción de crear préstamo.

## Sprint 4 — Cobros y caja

- Mostrar en la ficha del cliente sus pagos.

- Definir si el ayudante ve el saldo de caja.

## Sprint 5 — Panel, auditoría y piloto

- Trigger que impida `UPDATE` y `DELETE` en la tabla `auditoria`.
- Paginación del listado de clientes en el servidor si un negocio supera los 200 clientes (hoy se muestran los primeros 200 y se pide usar el buscador).
- Configurar un SMTP propio en Supabase antes del piloto con prestamistas reales.
- Vistas previas de Vercel desactivadas en el primer despliegue: solo `main` se despliega, como producción (ver `docs/despliegue.md`). Vercel ejecuta las vistas previas con `NODE_ENV=production`, así que exigen `URL_APP`. Para reactivarlas: definir `URL_APP` por vista previa (cada una tiene una URL distinta, por ejemplo a partir de `VERCEL_BRANCH_URL`) para que los correos no apunten a producción, agregar esas URL a Redirect URLs en Supabase y quitar el Ignored Build Step.
- Con el SMTP propio configurado, pasar las plantillas "Confirm signup" y "Reset password" al enlace con `token_hash`:
  - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/completar-registro`
  - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/restablecer-contrasena`

  `/auth/confirm` ya acepta ese formato (`verifyOtp`). Así el enlace funciona aunque se abra en otro navegador.

  Ojo: el registro desde una invitación usa `next=/invitacion/<codigo>` (va en `emailRedirectTo`). La plantilla "Confirm signup" no puede fijar `next=/completar-registro`: debe tomar el destino de `{{ .RedirectTo }}` para que el invitado vuelva a su invitación.
- Carga opcional de los feriados nacionales de Bolivia en la lista de feriados del negocio (hoy se cargan a mano, uno por uno). No se cargan automáticamente.
- Ver las invitaciones vencidas, usadas o revocadas en la pantalla de usuarios (hoy solo se muestran las pendientes; el historial queda en auditoría).
