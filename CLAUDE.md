CLAUDE.md — Sistema de gestión para prestamistas

Guía permanente para Claude Code en este repositorio. Leer completo antes de cualquier tarea. El alcance funcional detallado y las reglas de negocio están en docs/alcance.md: es obligatorio consultarlo antes de implementar cualquier funcionalidad de dominio.

1. Qué es este proyecto

Aplicación web (mobile-first) para prestamistas particulares: personas que prestan su propio dinero y hoy llevan el control en cuadernos o Excel. No es un sistema bancario ni una entidad financiera regulada.

Objetivo: que el prestamista sepa en todo momento quién le debe, cuánto, desde cuándo, a quién cobrar hoy, cuánto dinero tiene en la calle y cuánto ganó realmente.

Usuario típico: trabaja solo o con 1–2 ayudantes, usa principalmente el celular, no es técnico ni contador. Toda decisión de UX debe priorizar la simplicidad y la rapidez (registrar un préstamo o un cobro en menos de un minuto).

País inicial: Bolivia. Moneda: bolivianos (BOB). Zona horaria: America/La_Paz.

2. Glosario del dominio (usar estos términos en código, UI y base de datos)
Negocio: el prestamista que usa el sistema (tenant). Todo dato pertenece a un negocio.
Usuario: persona que inicia sesión. Pertenece a uno o más negocios mediante una membresía con un rol.
Cliente: la persona que recibe el préstamo (deudor).
Plantilla de préstamo: conjunto de condiciones predefinidas por el negocio ("Diario 24 días", "Mensual 3 %").
Condiciones: parámetros de interés, frecuencia, cuotas, comisión, mora y redondeo de un préstamo.
Préstamo: dinero entregado a un cliente con condiciones congeladas (snapshot) al desembolsar.
Cuota: cada pago programado del cronograma.
Pago: dinero recibido de un cliente. Es inmutable.
Aplicación de pago: distribución de un pago entre comisión, mora, interés y capital de las cuotas.
Movimiento de caja: toda entrada o salida de dinero (desembolso, cobro, gasto, aporte, retiro).
Capital en la calle: suma del capital pendiente de todos los préstamos vigentes.
Ganancia cobrada: intereses + mora + comisiones efectivamente cobrados.
3. Stack definitivo (no agregar ni cambiar sin autorización explícita)
Framework: Next.js 16 (App Router), React 19, TypeScript en modo estricto.
Estilos y UI: Tailwind CSS 4, shadcn/ui (estilo base-vega, color base neutral), iconos lucide-react, notificaciones con sonner.
Backend: Server Components para lectura, Server Actions para escritura. Route Handlers solo para webhooks y tareas programadas.
Base de datos: PostgreSQL en Supabase.
ORM y migraciones: Drizzle ORM + drizzle-kit, driver postgres (con prepared statements desactivados por el pooler de Supabase).
Autenticación: Supabase Auth (paquete ssr), sesión gestionada desde el proxy de Next.js.
Archivos: Supabase Storage (fotos de clientes, garantías, documentos).
Validación: Zod 4 (mismo esquema en formulario y servidor).
Formularios: React Hook Form con resolver de Zod.
Tablas: TanStack Table.
Dinero: decimal.js.
Fechas: date-fns + @date-fns/tz.
PDF: @react-pdf/renderer.
Excel: exceljs (el paquete xlsx de npm está prohibido por vulnerabilidades conocidas).
Tests: Vitest.
Despliegue: Vercel + Supabase.

Si una tarea parece requerir una dependencia nueva, detenerse y pedir autorización explicando el motivo.

4. Arquitectura y estructura de carpetas

Monolito modular. Cada módulo de negocio es autocontenido.

src/app/ — solo rutas, layouts y composición de páginas. Sin lógica de negocio.
(auth)/ — login, registro, recuperación de contraseña.
(panel)/ — todo lo que requiere sesión (layout con barra lateral).
src/modules/<modulo>/ — un módulo por área de negocio: negocio, configuracion, clientes, prestamos, cobros, caja, panel, auditoria.
componentes/ — componentes de UI propios del módulo.
acciones/ — Server Actions (escritura).
consultas/ — funciones de lectura a la base de datos.
dominio/ — lógica pura sin dependencias de framework ni base de datos (cálculos, reglas). Aquí vive el motor de cálculo.
esquemas/ — esquemas Zod y tipos.
Tests junto al archivo que prueban, con sufijo .test.ts.
src/shared/ — lo transversal:
ui/ — componentes de shadcn (los alias de components.json deben apuntar aquí).
componentes/ — componentes compartidos propios (encabezado de página, badge de estado, campo de monto, tabla de datos, tarjeta de indicador).
db/ — conexión, esquema de Drizzle y helpers de acceso.
auth/ — clientes de Supabase (server y browser), obtención de sesión, verificación de rol y negocio.
lib/ — utilidades: dinero, fechas, auditoría, formato.
drizzle/ — migraciones generadas.
docs/ — documentación funcional.

Reglas de dependencia: un módulo no importa internals de otro módulo; si necesita algo, se expone desde el módulo dueño. dominio/ nunca importa de Next.js, Supabase ni Drizzle.

5. Reglas no negociables
Dinero y cálculos
Nunca usar number, parseFloat, Number() ni aritmética nativa para montos o tasas. Siempre decimal.js.
En base de datos: montos como numeric(14,2), tasas como numeric(9,4). Drizzle los entrega como texto: convertir directo a Decimal.
El motor de cálculo se desarrolla con TDD. Ningún cambio en dominio/ sin tests que lo cubran.
Diferencias de redondeo del cronograma se ajustan en la última cuota.
Multi-negocio y seguridad
Toda tabla de negocio tiene negocio_id. Toda consulta y toda Server Action filtra por el negocio de la sesión, obtenido mediante el helper central de autenticación. Nunca confiar en un negocio_id enviado por el cliente.
Drizzle se conecta con un rol que omite RLS: el filtrado por negocio en la aplicación es obligatorio. RLS de Supabase se configura como segunda capa.
Toda Server Action: valida sesión → valida rol → valida datos con Zod → ejecuta en transacción si escribe más de una tabla → registra auditoría.
Nunca leer, modificar ni imprimir .env.local ni secretos.
Integridad financiera
Los pagos son inmutables: no se editan ni se borran. Se anulan con motivo obligatorio y queda registro.
Las condiciones del préstamo se congelan al desembolsar. Cambiar una plantilla o la configuración nunca altera préstamos existentes.
Ningún registro financiero se elimina físicamente. Se usan estados (anulado, cancelado).
Toda operación que crea, modifica o anula información financiera registra auditoría (quién, qué, cuándo, valor anterior y nuevo).
Fechas
Vencimientos y fechas de negocio con tipo date (sin hora). Marcas de tiempo con timestamp con zona horaria.
"Hoy" siempre se calcula en la zona horaria del negocio (America/La_Paz por defecto), nunca con la hora UTC del servidor.
Legal (Bolivia)
La mora se calcula solo sobre capital vencido, nunca sobre intereses impagos (prohibición de anatocismo, art. 412 del Código Civil).
Cada préstamo calcula su tasa mensual equivalente incluyendo comisiones. Si supera el tope del negocio (3 % mensual por defecto, art. 409 del Código Civil), se advierte, se pide confirmación y se registra en auditoría. No se bloquea.
6. Convenciones de código
Identificadores del dominio en español y sin tildes (prestamo, cuota, fechaVencimiento). Términos técnicos genéricos pueden quedar en inglés (props, handler).
Base de datos en snake_case; TypeScript en camelCase; componentes en PascalCase; archivos en kebab-case.
Toda la interfaz en español. Formato de dinero: "Bs 1.234,56". Formato de fecha: dd/mm/aaaa.
Server Components por defecto; "use client" solo cuando haya interactividad.
Server Actions devuelven un resultado tipado de éxito o error con mensaje para el usuario; no lanzan excepciones hacia la UI.
Mensajes de error claros para un usuario no técnico.
Sin comentarios obvios; comentar solo reglas de negocio no evidentes, citando la regla de docs/alcance.md.
7. Diseño visual
Mobile-first. Áreas táctiles de al menos 44 px. Probar siempre en ancho de 375 px.
Tipografía única: IBM Plex Sans (eliminar Geist e Inter).
Color de acento institucional: azul petróleo. Base neutral de shadcn.
Colores de estado, siempre acompañados de texto (nunca solo color):
Vigente / al día: verde.
Por vencer: ámbar.
En mora / vencida: rojo.
Cancelado / pagada: gris.
Refinanciado: azul.
Anulado: gris tachado.
Montos alineados a la derecha con cifras tabulares.
Las acciones destructivas o irreversibles (anular pago) siempre piden confirmación con motivo.
8. Flujo de trabajo
Ramas: main (producción), develop (integración), feature/<descripcion-corta> desde develop.
Commits pequeños con Conventional Commits en español (feat, fix, chore, refactor, test, docs).
Antes de una funcionalidad nueva: proponer un plan y esperar aprobación.
Antes de dar una tarea por terminada, deben pasar: lint, verificación de tipos, tests y build.
Migraciones: nunca editar una migración ya aplicada; crear una nueva. Pedir confirmación antes de cualquier migración que borre o renombre columnas.
Al terminar cada tarea, informar: qué se hizo, archivos principales tocados, decisiones tomadas y pendientes.
Si algo de este documento o de docs/alcance.md es ambiguo o contradictorio, preguntar antes de asumir.
9. Next.js 16

Esta versión de Next.js tiene cambios incompatibles con versiones anteriores (APIs, convenciones y estructura de archivos). Antes de escribir código de Next.js, seguir las indicaciones de AGENTS.md y consultar la guía correspondiente en node_modules/next/dist/docs/.
