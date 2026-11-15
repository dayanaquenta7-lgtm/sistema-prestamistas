# Pendientes

Decisiones y tareas aplazadas, ordenadas por el sprint en que deben resolverse. Al cerrar un pendiente, eliminarlo de esta lista y mencionarlo en el commit correspondiente.

## Sprint 1 — Configuración y clientes

- Selector de negocio para usuarios con más de una membresía.

## Sprint 2 — Motor de cálculo

- El Simulador muestra la ganancia; el ayudante no puede ver ganancias. Definir cómo se presenta el Simulador para ese rol.

## Sprint 4 — Cobros y caja

- Definir si el ayudante ve el saldo de caja.

## Sprint 5 — Panel, auditoría y piloto

- Trigger que impida `UPDATE` y `DELETE` en la tabla `auditoria`.
- Configurar un SMTP propio en Supabase antes del piloto con prestamistas reales.
- Definir `URL_APP` en producción y cargar la URL de producción en Supabase (Site URL y Redirect URLs con `/auth/confirm**`).
- Definir `URL_APP` para las vistas previas de Vercel (cada una tiene una URL distinta), para que los correos no apunten a producción. También agregar esas URL a Redirect URLs en Supabase.
- Con el SMTP propio configurado, pasar las plantillas "Confirm signup" y "Reset password" al enlace con `token_hash`:
  - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/completar-registro`
  - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/restablecer-contrasena`

  `/auth/confirm` ya acepta ese formato (`verifyOtp`). Así el enlace funciona aunque se abra en otro navegador.
