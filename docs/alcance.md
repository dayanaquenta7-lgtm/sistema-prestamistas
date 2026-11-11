# Alcance funcional y reglas de negocio

Documento de referencia del producto. Define qué debe hacer el sistema, sus reglas de negocio y el orden de construcción. Ubicación en el repositorio: `docs/alcance.md`.

---

## 1. Roles y permisos

| Acción | Dueño | Ayudante |
|---|---|---|
| Configurar negocio, plantillas y tope legal | Sí | No |
| Crear y editar clientes | Sí | Sí |
| Crear préstamos | Sí | Configurable (por defecto no) |
| Registrar cobros | Sí | Sí |
| Anular pagos | Sí | No |
| Registrar gastos | Sí | Sí |
| Ver ganancias, capital y reportes | Sí | No |
| Gestionar usuarios del negocio | Sí | No |
| Ver auditoría | Sí | No |

Al registrarse, el usuario crea su negocio y queda como dueño.

---

## 2. Módulos del MVP

### 2.1 Negocio y configuración
- Datos del negocio: nombre, moneda (BOB), zona horaria (America/La_Paz).
- **Condiciones por defecto** del negocio.
- **Plantillas de préstamo**: crear, editar, activar o desactivar. Cada una con nombre y condiciones completas.
- **Tope de tasa mensual** para la alerta legal (3 % por defecto, editable).
- **Calendario de feriados** del negocio (lista de fechas).
- Gestión de usuarios: invitar ayudante por correo, cambiar rol, desactivar.

### 2.2 Clientes
- Ficha: nombre completo (obligatorio), CI, teléfono, dirección, referencia (nombre y teléfono), foto opcional, notas.
- **Tasa preferencial** opcional.
- Estado del cliente derivado: sin préstamos, al día, en mora.
- Vista de detalle: datos, préstamos (vigentes e históricos), pagos y total adeudado.
- Búsqueda por nombre, CI o teléfono.
- Marca de "no prestar" con motivo.

### 2.3 Préstamos
- **Simulador**: elegir plantilla, monto y fecha; ver cronograma, total a pagar, ganancia y tasa mensual equivalente sin guardar nada.
- **Crear préstamo**: cliente + plantilla + monto + fecha de desembolso, con ajuste manual de condiciones. Muestra el cronograma antes de confirmar.
- Al confirmar: congela condiciones, genera cuotas, registra la salida de caja por el monto entregado (neto de comisión si es descontada) y registra auditoría.
- **Alerta legal** si la tasa mensual equivalente supera el tope: confirmación explícita y registro en auditoría.
- **Documento del préstamo en PDF** (reconocimiento de deuda o pagaré con el cronograma) para imprimir y firmar.
- Detalle del préstamo: condiciones, cronograma con estado de cada cuota, pagos aplicados, saldo de capital, interés pendiente y mora acumulada.
- Anular préstamo: solo si no tiene pagos, con motivo.

### 2.4 Cobros
- **Pantalla "Cobrar hoy"** (pantalla principal tras iniciar sesión): cuotas que vencen hoy y cuotas vencidas, ordenadas por antigüedad de atraso, con monto, cliente y teléfono.
- **Registrar pago**: monto, fecha, medio (efectivo, transferencia, QR) y nota opcional. Muestra la vista previa de cómo se aplicará antes de confirmar.
- Pagos parciales, de una cuota completa, de varias cuotas o adelantados.
- **Recibo** en PDF y enlace para enviar el resumen por WhatsApp (enlace de WhatsApp con texto prellenado).
- **Anular pago** (solo el dueño): motivo obligatorio. Revierte la aplicación y genera el movimiento de caja inverso.
- Cancelación total anticipada: calcula el monto para liquidar el préstamo a la fecha.

### 2.5 Caja
- Movimientos automáticos: desembolsos (salida), cobros (entrada), anulaciones (inverso).
- Movimientos manuales: aporte de capital, retiro del dueño, gasto (con categoría: transporte, comunicación, otros).
- Saldo de caja actual y movimientos filtrables por fecha y tipo.
- Cierre del día: resumen de lo cobrado, lo prestado y los gastos.

### 2.6 Panel de inicio (indicadores)
- Capital en la calle.
- Por cobrar hoy / cobrado hoy.
- Cobrado en el mes.
- Ganancia cobrada del mes (intereses + mora + comisiones).
- Interés pendiente por cobrar.
- Préstamos en mora: cantidad y monto vencido.
- Saldo de caja.

### 2.7 Auditoría
- Registro de: creación y anulación de préstamos, pagos y anulaciones, cambios de configuración y plantillas, cambios de tasa preferencial, confirmaciones de alerta legal, gestión de usuarios.
- Cada registro: usuario, fecha y hora, acción, entidad, valor anterior y valor nuevo.
- Vista de consulta con filtros (solo dueño). No editable.

---

## 3. Condiciones del préstamo

| Parámetro | Opciones |
|---|---|
| Método de interés | flat (sobre capital inicial), saldo (sobre saldo, cuota fija), solo_interes (capital al final), monto_fijo ("presto 1.000, devuelve 1.200") |
| Tasa y su período | % diario, semanal, quincenal, mensual, anual o total del préstamo |
| Frecuencia de pago | Diaria, semanal, quincenal, mensual o pago único |
| Número de cuotas | 1 a 730 |
| Comisión | Ninguna, porcentaje o monto fijo; descontada del desembolso o financiada |
| Mora | Ninguna, % diario sobre capital vencido, monto por día o monto por cuota; con días de gracia |
| Días no cobrables | Días de la semana (por ejemplo, domingo); omitir feriados sí/no |
| Redondeo de cuota | Al centavo, a 0,50 o al boliviano entero |

### Cascada de resolución
Condiciones del negocio → plantilla elegida → tasa preferencial del cliente (si existe) → ajuste manual al crear el préstamo. El resultado se congela en el préstamo al confirmar.

---

## 4. Reglas de negocio

**RN-01 Snapshot.** Las condiciones se guardan completas dentro del préstamo. Cambios posteriores en plantillas o configuración no lo afectan.

**RN-02 Fechas de vencimiento.** Se generan según la frecuencia a partir de la fecha de desembolso. Si una fecha cae en día no cobrable o feriado (si está activo), se corre al siguiente día hábil. En frecuencia diaria, los días no cobrables simplemente se saltan.

**RN-03 Redondeo.** La cuota se redondea según la configuración; la diferencia acumulada se ajusta en la última cuota para que el total cuadre exacto.

**RN-04 Métodos.**
- flat: interés total = capital × tasa × períodos; se reparte en partes iguales entre las cuotas junto con el capital.
- saldo: cuota fija calculada sobre el saldo (sistema francés); el interés de cada cuota se calcula sobre el saldo de capital.
- solo_interes: cada cuota es solo interés; la última incluye todo el capital.
- monto_fijo: el interés total es el monto indicado; se reparte en partes iguales.
- Si el período de la tasa difiere de la frecuencia de pago, se convierte proporcionalmente (interés simple) usando 30 días por mes, 7 por semana y 15 por quincena.

**RN-05 Prelación de pagos.** Cada pago se aplica a la cuota vencida más antigua primero y, dentro de cada cuota, en este orden: comisión financiada → mora → interés → capital. El excedente pasa a la siguiente cuota. Si sobra después de cubrir todo lo vencido, se aplica a las cuotas futuras en orden.

**RN-06 Mora.** Se calcula únicamente sobre el capital vencido e impago, desde el día siguiente al vencimiento más los días de gracia. Nunca sobre intereses (art. 412 del Código Civil). La mora se calcula al momento de consultar o cobrar; no se acumula con un proceso nocturno.

**RN-07 Estados derivados.**
- Cuota: pendiente, por vencer (vence dentro de 3 días o menos), vencida, parcial, pagada.
- Préstamo: vigente, en mora (al menos una cuota vencida con saldo), cancelado (todo pagado), refinanciado, anulado.
- Los estados en mora y por vencer se derivan de la fecha actual del negocio; no se guardan.

**RN-08 Pagos inmutables.** Un pago no se edita ni se borra. La anulación conserva el registro original, revierte su aplicación, genera el movimiento de caja inverso y registra motivo y usuario.

**RN-09 Alerta legal.** La tasa mensual equivalente se calcula como el total de intereses + comisiones dividido entre el capital y entre el plazo en meses (días desde el desembolso hasta la última cuota / 30). Si supera el tope del negocio, se exige confirmación explícita y se audita.

**RN-10 Caja.** Todo dinero que entra o sale queda como movimiento de caja vinculado a su origen. El saldo de caja es siempre la suma de movimientos; nunca un valor editable.

**RN-11 Ganancia.** La ganancia cobrada se toma de las porciones de interés, mora y comisión de los pagos aplicados (no anulados). Los gastos se restan para la ganancia neta.

**RN-12 Refinanciación (fase 2).** El préstamo original pasa a refinanciado. El nuevo préstamo toma como capital el capital pendiente más el dinero nuevo entregado. Los intereses y la mora vencidos no se capitalizan automáticamente: se cobran o se condonan con registro en auditoría.

---

## 5. Casos de prueba de referencia del motor

| Caso | Entrada | Resultado esperado |
|---|---|---|
| Flat diario | Bs 1.000, 20 % total, 24 cuotas diarias sin domingos | 24 cuotas de Bs 50,00; supera el tope |
| Saldo (francés) | Bs 10.000, 3 % mensual, 12 cuotas mensuales | Cuota de Bs 1.004,62; no supera el tope |
| Solo interés | Bs 5.000, 3 % mensual, 6 meses | 5 cuotas de Bs 150 y última de Bs 5.150 |
| Monto fijo | Bs 1.000, devuelve Bs 1.200, 4 cuotas semanales | 4 cuotas de Bs 300; supera el tope |
| Prelación | Cuota de Bs 100 (80 capital + 20 interés) vencida con Bs 5 de mora, pago de Bs 50 | Mora 5, interés 20, capital 25; cuota parcial |

Se deben agregar casos de redondeo, días no cobrables, feriados, pagos adelantados y anulaciones.

---

## 6. Fuera del MVP

**Fase 2:** PWA con trabajo sin conexión, recordatorios automáticos por WhatsApp, refinanciación y reestructuración, garantías con fotos, exportación a Excel, socios o aportantes de capital, ruta de cobro.

**Fase 3:** modelo SaaS con suscripciones, portal del cliente para consultar su deuda, segunda moneda (USD), reportes avanzados.

---

## 7. Plan de sprints (1 semana cada uno)

| Sprint | Objetivo | Entregable verificable |
|---|---|---|
| 0 | Cimientos | Login funcional, negocio creado al registrarse, layout del panel, utilidades probadas, primera migración |
| 1 | Configuración y clientes | Plantillas, feriados, tope legal; CRUD de clientes con búsqueda |
| 2 | Motor de cálculo | Dominio con tests de todos los casos de referencia; simulador en pantalla |
| 3 | Préstamos | Crear préstamo con alerta legal, cronograma, detalle, PDF del documento, salida de caja |
| 4 | Cobros y caja | Cobrar hoy, registrar y anular pagos, recibo, caja y gastos |
| 5 | Panel, auditoría y piloto | Indicadores, vista de auditoría, pulido móvil, prueba con prestamistas reales |