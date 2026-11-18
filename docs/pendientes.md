# Pendientes

Decisiones y tareas aplazadas, ordenadas por el sprint en que deben resolverse. Al cerrar un pendiente, eliminarlo de esta lista y mencionarlo en el commit correspondiente.

## Sprint 1 — Configuración y clientes

- Selector de negocio para usuarios con más de una membresía.
- Foto del cliente en Supabase Storage (docs/alcance.md, 2.2). Quedó fuera de la parte 1: crear el bucket con acceso restringido por negocio y asignarla a la parte 2 o a un sprint posterior.
- Prueba con sesión del módulo de clientes en 375 px y 1280 px, con dueño y con ayudante (los pasos están en el resumen de la parte 1).
- Búsqueda de clientes sin distinguir tildes ("Pérez" = "Perez"): requiere la extensión `unaccent` y una migración que la cree.

## Sprint 2 — Motor de cálculo

- El Simulador muestra la ganancia; el ayudante no puede ver ganancias. Definir cómo se presenta el Simulador para ese rol.

## Sprint 3 — Préstamos

- Definir el período de la tasa preferencial del cliente al implementar la cascada de condiciones (docs/alcance.md, sección 3). Propuesta: se interpreta en el período de la tasa de la plantilla elegida.
- Calcular el estado del cliente (sin préstamos, al día, en mora) y el total adeudado con los préstamos reales: hoy `estadosPrestamos()` devuelve una lista vacía y el total es Bs 0,00 (src/modules/clientes/consultas/clientes.ts).
- Mostrar en la ficha del cliente sus préstamos vigentes e históricos.
- Avisar al crear un préstamo para un cliente marcado como no prestar.

## Sprint 4 — Cobros y caja

- Mostrar en la ficha del cliente sus pagos.

- Definir si el ayudante ve el saldo de caja.

## Sprint 5 — Panel, auditoría y piloto

- Trigger que impida `UPDATE` y `DELETE` en la tabla `auditoria`.
- Paginación del listado de clientes en el servidor si un negocio supera los 200 clientes (hoy se muestran los primeros 200 y se pide usar el buscador).
- Configurar un SMTP propio en Supabase antes del piloto con prestamistas reales.
- Definir `URL_APP` en producción y cargar la URL de producción en Supabase (Site URL y Redirect URLs con `/auth/confirm**`).
- Definir `URL_APP` para las vistas previas de Vercel (cada una tiene una URL distinta), para que los correos no apunten a producción. También agregar esas URL a Redirect URLs en Supabase.
- Con el SMTP propio configurado, pasar las plantillas "Confirm signup" y "Reset password" al enlace con `token_hash`:
  - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/completar-registro`
  - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/restablecer-contrasena`

  `/auth/confirm` ya acepta ese formato (`verifyOtp`). Así el enlace funciona aunque se abra en otro navegador.
