CLAUDE.md — Sistema de Gestión de Préstamos
Idioma y comunicación
Responde SIEMPRE en español: explicaciones, comentarios de código, mensajes de commit y documentación.
Sé directo y conciso. Sin introducciones de cortesía.
Si un requisito es ambiguo o afecta cálculos financieros, PREGUNTA antes de implementar. Nunca inventes reglas de negocio.
Descripción del proyecto

Sistema web responsivo para prestamistas: gestión de clientes, garantes, productos de crédito, préstamos, cronogramas, cobranza, mora, garantías, caja, reportes, usuarios/roles y auditoría. Contexto: Bolivia (monedas BOB y USD, feriados nacionales, CI con expedición).

Stack (no cambiar ni agregar librerías sin consultar)
Lenguaje: TypeScript en modo estricto (strict: true). Prohibido any.
Framework: Next.js (App Router) con Server Components y Server Actions.
UI: shadcn/ui + Tailwind CSS. Iconos: lucide-react.
Base de datos: PostgreSQL en Supabase.
ORM: Drizzle ORM + drizzle-kit (migraciones).
Autenticación y archivos: Supabase Auth y Supabase Storage.
Formularios y validación: React Hook Form + Zod.
Tablas: TanStack Table (Data Table de shadcn). Gráficos: Recharts (shadcn Charts).
Dinero: decimal.js. Fechas: date-fns.
PDF: @react-pdf/renderer. Excel: SheetJS (xlsx).
Pruebas: Vitest.
Notificaciones: WhatsApp Cloud API (Meta).
Hosting: Vercel (web) + Supabase (BD).
Arquitectura: monolito modular en capas

El código se agrupa por módulo de negocio en src/modules/<modulo>/. Cada módulo tiene cuatro capas:

Capa	Carpeta	Responsabilidad
Presentación	ui/ y src/app/	Componentes, páginas, hooks de UI. Sin lógica de negocio.
Aplicación	application/	Casos de uso que orquestan una operación completa.
Dominio	domain/	Reglas de negocio PURAS: cálculos, validaciones de negocio, tipos.
Infraestructura	infrastructure/	Repositorios Drizzle, Storage, APIs externas, PDF.

Archivos de entrada por módulo: actions.ts (Server Actions) y schemas.ts (Zod).

Regla de dependencias (obligatoria)
Presentación → Aplicación → Dominio ← Infraestructura.
domain/ NO importa nada de Next.js, React, Drizzle, Supabase ni de otras capas.
Las páginas en src/app/ son delgadas: solo componen componentes del módulo y llaman a actions.
Un módulo no accede a las tablas de otro directamente; usa los casos de uso o repositorios exportados de ese módulo.
Lo común va en src/shared/ (componentes shadcn, conexión BD, auth, utilidades de dinero, fechas, auditoría).
Estructura
text
src/
├── app/                    # Rutas Next.js: (auth)/ y (panel)/
├── modules/
│   └── <modulo>/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       ├── ui/
│       ├── actions.ts
│       └── schemas.ts
└── shared/
    ├── components/ui/      # shadcn (no editar salvo necesidad)
    ├── db/                 # Esquema Drizzle y conexión
    ├── auth/
    └── lib/                # dinero.ts, fechas.ts, auditoria.ts

Módulos: dashboard, clientes, garantes, productos, solicitudes, prestamos, garantias, cobranza, mora, cobradores, caja, inversionistas, contabilidad, notificaciones, documentos, reportes, usuarios, auditoria, configuracion, portal-cliente.

Reglas financieras (CRÍTICAS)
NUNCA usar number para dinero, tasas o porcentajes. Usar Decimal (decimal.js) en código y NUMERIC(14,2) en BD (tasas: NUMERIC(9,6)).
Redondeo: 2 decimales, ROUND_HALF_UP, salvo que la configuración indique otro. La última cuota absorbe la diferencia de redondeo.
Métodos de cálculo soportados: interés simple, francés (cuota fija), alemán (capital fijo).
Orden de aplicación de pagos por defecto: mora → interés → capital (configurable por producto).
Toda operación que mueva dinero (desembolso, pago, anulación, condonación, movimiento de caja) se ejecuta en UNA transacción de BD y genera registro de auditoría.
Los pagos y movimientos NUNCA se borran: se anulan con motivo, usuario y fecha.
Las fechas de vencimiento respetan domingos y feriados según la configuración.
Montos siempre asociados a una moneda (BOB o USD).
Seguridad
Validar TODA entrada con Zod en el servidor, aunque ya se valide en el cliente.
Verificar sesión y permisos del rol en cada Server Action antes de ejecutar.
Nunca exponer secretos en código cliente. Solo variables NEXT_PUBLIC_* llegan al navegador.
Nunca commitear .env* (excepto .env.example).
Activar Row Level Security en tablas de Supabase.
Convenciones de código
Nombres de dominio en español (prestamo, cuota, registrarPago); términos técnicos en inglés cuando sean estándar (repository, schema, hook).
Archivos y carpetas en kebab-case: crear-prestamo.ts.
Componentes en PascalCase. Funciones y variables en camelCase. Tablas y columnas en snake_case.
Funciones pequeñas con una sola responsabilidad.
Comentarios solo cuando expliquen el porqué, no el qué.
Manejar errores con mensajes claros en español para el usuario final.
UI responsiva mobile-first: probar en anchos de 375 px y 1280 px.
Diseño visual (obligatorio en toda pantalla)

El sistema debe verse como software financiero profesional: limpio, serio, ordenado y sobrio. Referencia de estilo: herramientas de banca, contabilidad y ERP modernos, no landing pages ni plantillas de IA.

Principios
Función antes que decoración. Cada elemento visual debe ayudar a leer, comparar o actuar. Si no aporta, se elimina.
Jerarquía clara. Lo más importante de cada pantalla (saldo, estado, monto en mora) se distingue por tamaño, peso y posición, no por colores llamativos.
Densidad adecuada. Es un sistema de trabajo diario: mostrar información suficiente sin desperdiciar espacio, pero con aire entre secciones.
Consistencia total. El mismo tipo de dato se ve igual en todas las pantallas (montos, fechas, estados, acciones).
Paleta
Base neutra: grises fríos para fondos, bordes y texto secundario. Fondo principal blanco o gris muy claro.
UN solo color de acento institucional, sobrio (ej. azul marino o verde petróleo), usado solo para acciones principales y elementos activos.
Colores semánticos reservados para estados, siempre con el mismo significado:
Verde: vigente / pagado. Ámbar: por vencer / advertencia. Rojo: en mora / error / anulado. Gris: cancelado / inactivo.
Definir todos los colores como variables CSS del tema de shadcn. Prohibidos colores sueltos en clases (bg-[#...]).
Tipografía
Una sola familia sans-serif profesional para la interfaz (ej. IBM Plex Sans) y una monoespaciada o con cifras tabulares para números.
Escala tipográfica corta y fija (máximo 5 tamaños en todo el sistema).
Todos los montos con tabular-nums, alineados a la derecha en tablas y con formato boliviano: Bs 1.234,56 / $us 1.234,56.
Fechas en formato dd/mm/aaaa.
Componentes y layout
Layout fijo: barra lateral de navegación + encabezado de página (título, breadcrumb, acciones principales a la derecha) + contenido.
Bordes finos (1px) y sombras mínimas o nulas. Radio de borde pequeño y uniforme (rounded-md).
Espaciado con la escala de Tailwind, siempre los mismos valores para el mismo propósito.
Tablas como componente principal de datos: encabezados claros, filas compactas, filtros arriba, paginación abajo, acciones por fila en un menú.
Formularios en columnas alineadas, agrupados por secciones con título, etiquetas siempre visibles (no solo placeholder).
Estados de estado (vigente, mora…) como badges discretos de un mismo componente.
Iconos lucide-react solo cuando aporten significado, del mismo tamaño y grosor en todo el sistema.
Toda vista incluye estados: carga (skeleton), vacío (mensaje claro y acción sugerida) y error.
Acciones destructivas o irreversibles siempre con diálogo de confirmación.
No repetitivo
Crear componentes reutilizables en src/shared/components/ (encabezado de página, tarjeta de indicador, tabla de datos, badge de estado, campo de monto) en lugar de copiar markup.
No mostrar el mismo dato dos veces en una misma pantalla.
No llenar pantallas con filas de tarjetas idénticas: usar tarjetas de indicadores solo para los 3–5 KPI clave y el resto en tablas o gráficos.
Textos de la interfaz breves y directos, sin frases de relleno ni repetición de títulos.
Prohibido (estética típica de IA)
Degradados (fondos, botones o texto con gradiente), sobre todo morados, índigo o violetas.
Glassmorphism, desenfoques, brillos, neones, sombras grandes o de color.
Emojis en la interfaz.
Bordes muy redondeados (rounded-2xl, rounded-3xl, rounded-full en tarjetas o botones).
Secciones tipo "hero", ilustraciones decorativas o íconos gigantes dentro del panel.
Animaciones decorativas; solo transiciones breves y funcionales (≤150 ms).
Tarjetas con ícono en círculo de color + título + texto genérico repetidas en cuadrícula.
Mayúsculas, negritas o colores fuertes como recurso decorativo.
Accesibilidad
Contraste mínimo WCAG AA. Foco visible en todos los elementos interactivos.
El color nunca es el único indicador de un estado: acompañarlo con texto.
Diseño responsivo mobile-first: en celular, las tablas pasan a vista de lista y la barra lateral a menú desplegable.
Pruebas
Todo archivo de domain/ tiene pruebas Vitest (*.test.ts junto al archivo).
Casos obligatorios en cálculos: cuota única, muchas cuotas, tasa cero, redondeo, pagos parciales, pagos adelantados, mora con días de gracia.
No marcar una tarea como terminada si las pruebas fallan.
Comandos
bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilación de producción
npm run lint         # ESLint
npm run test         # Vitest
npm run db:generate  # Generar migración desde el esquema Drizzle
npm run db:migrate   # Aplicar migraciones
npm run db:studio    # Explorar la BD

Antes de dar una tarea por terminada: npm run lint, npm run test y npm run build sin errores.

Base de datos
El esquema vive en src/shared/db/schema/, un archivo por módulo.
Todo cambio de esquema se hace con migraciones de drizzle-kit. Nunca modificar la BD manualmente.
Columnas estándar en cada tabla: id (uuid), creado_en, actualizado_en, creado_por.
Git y GitHub
Ramas: main (producción), develop (integración), feature/<sprint>-<descripcion> (ej. feature/s2-cronograma-frances), fix/<descripcion>.
Nunca commitear directamente en main. Trabajar en feature/* y fusionar a develop mediante Pull Request.
Commits en español con Conventional Commits:
feat(prestamos): agregar cronograma método francés
fix(cobranza): corregir aplicación de pago parcial
test(mora): casos con días de gracia
Otros tipos: refactor, docs, chore, style.
Commits pequeños y atómicos. No hacer push ni fusionar sin que el usuario lo pida.
Metodología: Scrum
Sprints de 2 semanas. Cada historia de usuario se implementa de punta a punta (BD → dominio → aplicación → UI → pruebas).
Formato de historia: "Como <rol>, quiero <acción> para <beneficio>", con criterios de aceptación.
Trabajar UNA historia a la vez. Al terminar, resumir qué se hizo y qué falta.
Plan del MVP
Sprint	Entregable
0	Configuración del proyecto, autenticación, roles, layout base
1	Configuración general, productos de crédito, clientes y garantes
2	Dominio de cálculos (cronogramas, mora) con pruebas; crear y desembolsar préstamos
3	Cobranza: pagos, orden de aplicación, recibos PDF, anulaciones
4	Caja (apertura, cierre, arqueo), garantías básicas, auditoría
5	Dashboard, reportes básicos, mora básica, pruebas finales
Lo que NO debes hacer
Instalar dependencias nuevas sin consultar.
Usar number o parseFloat para dinero.
Poner lógica de negocio en componentes o páginas.
Borrar registros financieros.
Modificar migraciones ya aplicadas.
Desactivar reglas de TypeScript o ESLint para "hacer que compile".
Inventar reglas de negocio no definidas: preguntar.
Usar degradados, glassmorphism, emojis, bordes muy redondeados o cualquier elemento de la lista "Prohibido" de Diseño visual.
Duplicar markup de UI en lugar de crear o reutilizar un componente compartido.