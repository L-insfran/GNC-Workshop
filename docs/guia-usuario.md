# Guía de usuario — GNC Workshop

**Sistema de gestión para talleres de GNC**

Esta guía explica cómo usar cada parte del sistema, paso a paso. Está pensada para el día a día del taller: recepción, taller, depósito, caja y administración.

> **Guías por rol:** si preferís una versión corta según tu puesto, mirá [Guías por rol](guia-usuario/README.md).
>
> **PDF:** [GNC-Workshop-Guia-de-Usuario.pdf](pdf/GNC-Workshop-Guia-de-Usuario.pdf) (guía completa + roles).

---

## 1. Cómo empezar

### Iniciar sesión

1. Abrí el sistema en el navegador.
2. Ingresá tu **usuario** y **contraseña**.
3. Hacé clic en **Iniciar sesión**.

Al entrar verás el menú lateral con los módulos según tu rol (no todos ven las mismas pantallas).

### Consejos generales

- Usá la **búsqueda** y los **filtros** en los listados para encontrar rápido.
- Antes de eliminar o anular algo, el sistema suele pedir confirmación.
- El flujo habitual del taller es: **Cliente → Vehículo → Equipo GNC → Turno u Orden de trabajo → Factura / Cobro**.

---

## 2. Panel de inicio (Dashboard)

Es la pantalla principal. Muestra un resumen del taller.

### Qué vas a ver

- Indicadores del día (órdenes activas, producción, etc.).
- **Alertas de vencimientos** (oblea GNC y prueba hidráulica de cilindros).
- Alertas operativas (por ejemplo, stock bajo u órdenes pendientes).

### Cómo avisar un vencimiento al cliente

1. Entrá al **Dashboard**.
2. Buscá la sección de **vencimientos pendientes**.
3. Elegí al cliente de la lista.
4. Abrí el aviso por **WhatsApp** o **correo** (según lo disponible).
5. Cuando ya hayas contactado al cliente, marcá el aviso como **notificado**.

Así el taller no pierde de vista renovaciones de oblea y PH.

---

## 3. Clientes

Acá se registran las personas o empresas dueñas de los vehículos.

### Registrar un cliente nuevo

1. Menú **Clientes** → **Nuevo cliente**.
2. Completá:
   - Tipo: persona física o jurídica
   - Nombre / razón social
   - Tipo y número de documento (DNI, CUIT o CUIL)
   - Teléfono y email (recomendado)
   - Condición frente al IVA
   - Notas internas (opcional)
3. Guardá.
4. Se abre la **ficha del cliente**.

### Buscar o editar un cliente

1. En **Clientes**, usá el buscador (nombre, documento, etc.).
2. Abrí la ficha.
3. Editá los datos si hace falta y guardá.

### Desde la ficha del cliente podés

- Ver sus vehículos.
- Ir a crear un vehículo asociado.
- Continuar el flujo hacia equipo GNC u orden de trabajo.

---

## 4. Vehículos

Cada cliente puede tener uno o más vehículos.

### Registrar un vehículo

1. Menú **Vehículos** → **Nuevo vehículo**  
   *(o desde la ficha del cliente)*.
2. Seleccioná el **cliente**.
3. Completá:
   - Patente
   - Marca y modelo
   - Año
   - Tipo de combustible (nafta, diesel, GNC, dual)
   - Color, kilometraje, n.º de motor/chasis (si los tenés)
4. Guardá.

> Si no aparece la marca o el modelo, un administrador o supervisor debe cargarlos antes en **Configuración → Marcas y modelos**.

### Consultar un vehículo

1. Entrá a **Vehículos** o a la ficha del cliente.
2. Abrí el detalle: datos, equipo GNC asociado e historial relacionado.

---

## 5. Equipos GNC

Registra el equipo instalado en el vehículo: regulador, cilindros, oblea y fechas de PH.

### Registrar un equipo GNC

1. Menú **Equipos GNC** → **Nuevo equipo**.
2. Seleccioná el **vehículo**.
3. Completá:
   - Número de serie del equipo
   - Fecha de instalación
   - Marca y modelo del regulador
   - Certificador CRPC (si corresponde)
4. Agregá los **cilindros** (hasta 4), con:
   - Número de serie
   - Marca
   - Capacidad (m³)
   - Posición
   - Fecha de última PH
   - Fecha de fabricación (opcional)
5. Guardá.

### Por qué es importante

- Controlás vencimientos de **oblea** (anual) y **PH** (cada 5 años por cilindro).
- Es la base para crear órdenes de trabajo correctas (revisión, renovación, PH, etc.).

---

## 6. Agenda (turnos)

Calendario para citar clientes y, al llegar, generar la orden de trabajo.

### Crear un turno

1. Menú **Agenda** → **Nuevo turno**.
2. Elegí fecha y horario.
3. Seleccioná cliente (y vehículo, si aplica).
4. Indicá el motivo o tipo de atención.
5. Guardá.

### Cuando el cliente llega

1. Abrí el turno en la agenda.
2. Confirmá la asistencia.
3. Usá la opción **Generar orden de trabajo**.
4. Revisá los datos precompletados y confirmá la OT.

Así recepción deja de cargar todo de cero: el turno ya trae contexto.

---

## 7. Órdenes de trabajo (OT)

Es el corazón del taller: desde que entra el vehículo hasta que se entrega.

### Estados de una OT (en orden)

1. **Borrador** — armada, aún no confirmada
2. **Recepción** — el vehículo está en el taller
3. **En taller** — el mecánico trabaja
4. **En espera de repuesto** — falta material
5. **Control de calidad** — revisión final
6. **Finalizada** — trabajo aprobado
7. **Entregada** — el cliente retiró el vehículo

También puede **cancelarse** cuando corresponda.

### Crear una orden de trabajo

1. Menú **Órdenes de trabajo** → **Nueva orden**.
2. Seleccioná:
   - Cliente
   - Vehículo
   - Equipo GNC (si tiene)
   - Tipo de trabajo (instalación, revisión anual, renovación de oblea, PH, reparación, etc.)
3. Completá (opcional pero útil):
   - Prioridad
   - Fecha estimada de entrega
   - Kilometraje de ingreso
   - Mecánico asignado
   - Descripción del problema
   - Observaciones internas
   - Seña (si cobrás anticipo y tenés permiso)
4. Guardá.

### Seguir el trabajo (día a día)

1. Abrí la OT desde el listado o el **tablero**.
2. En **Cambiar estado**, pasá al siguiente estado según el avance.
3. Si falta repuesto: pasá a **En espera de repuesto** y volvé a **En taller** cuando llegue.
4. Cuando el trabajo esté listo: pasá a **Control de calidad**.

### Control de calidad (antes de finalizar)

En control de calidad se marca un checklist, por ejemplo:

- Sin fugas
- Presión del regulador OK
- Válvulas de seguridad OK
- Estanqueidad aprobada
- Documentación en orden

Solo con el control completo se puede pasar a **Finalizada**.

### Entrega al cliente

1. Verificá que la OT esté **finalizada**.
2. Revisá cobro / factura si corresponde.
3. Cambiá el estado a **Entregada**.

### Tablero de órdenes

En **Órdenes de trabajo → Tablero** ves las OT por columnas de estado. Sirve para supervisión y para que el taller vea de un vistazo qué hay en cada etapa.

### Imprimir una OT

Desde el detalle de la orden podés abrir la vista de impresión para entregar o archivar el comprobante interno del trabajo.

---

## 8. Inventario (depósito)

Controla productos, repuestos y movimientos de stock.

### Alta de un producto

1. Menú **Inventario** → **Nuevo producto**.
2. Completá nombre, categoría, código (si usan), stock mínimo y precios según corresponda.
3. Guardá.

### Registrar un movimiento de stock

1. **Inventario → Movimiento**.
2. Elegí el tipo:
   - **Ingreso** — compra o entrada
   - **Egreso** — salida / uso
   - **Ajuste** — corrección de stock
3. Seleccioná producto, cantidad y motivo.
4. Guardá.

### Alertas de stock bajo

En el listado de productos podés filtrar los que están por debajo del mínimo. El Dashboard también puede mostrar estas alertas.

---

## 9. Caja

Registra ingresos, egresos y el cierre del día.

### Registrar un movimiento

1. Menú **Caja** → **Nuevo movimiento**.
2. Indicá si es **ingreso** o **egreso**.
3. Completá monto, medio de pago y concepto.
4. Si corresponde, vinculá a una OT o factura.
5. Guardá.

### Ver saldo y movimientos

En la pantalla principal de **Caja** ves el saldo y el historial reciente.

### Arqueo del día

1. Entrá a **Caja → Arqueo**.
2. Revisá el resumen del día (ingresos, egresos, saldo).
3. Usalo para cerrar caja y contrastar con el efectivo/medios reales.

---

## 10. Facturación

Emite comprobantes internos del taller (con IVA).

> Por ahora son de **uso interno**; la facturación electrónica AFIP se incorporará más adelante.

### Generar una factura desde una OT

1. Abrí la orden de trabajo **finalizada** (o en condiciones de facturar).
2. Usá la opción para generar / vincular factura (o andá a **Facturación → Nueva**).
3. Revisá cliente, ítems e importes.
4. Confirmá la emisión.

### Consultar o anular

1. Menú **Facturación**.
2. Abrí el comprobante.
3. Si hay que anularlo, usá **Anular** (según permisos).
4. Si corresponde, generá una **nota de crédito** a partir del comprobante.

---

## 11. Configuración (administración)

Solo para roles de administración / supervisión (y depósito en categorías). Es la base para que el resto del sistema funcione bien.

| Sección | Para qué sirve |
|--------|----------------|
| **Usuarios** | Alta de personal y roles (administrador, recepción, mecánico, caja, depósito, etc.) |
| **Marcas y modelos** | Catálogo de vehículos |
| **Categorías** | Clasificación de productos del inventario |
| **Tipos de trabajo** | Instalación, revisión, PH, etc. |
| **Kits de trabajo** | Conjuntos de ítems/repuestos habituales para armar OTs más rápido |

### Ejemplo: crear un usuario

1. **Configuración → Usuarios → Nuevo**.
2. Completá nombre, email/usuario, contraseña y rol.
3. Guardá.

### Ejemplo: cargar marca y modelo

1. **Configuración → Marcas y modelos**.
2. Creá la marca.
3. Agregá los modelos de esa marca.

---

## 12. Flujo completo recomendado (día típico)

### Alta de un cliente nuevo con su auto

1. Registrar **cliente**.
2. Registrar **vehículo**.
3. Registrar **equipo GNC** (si ya lo tiene o se instaló).
4. Crear **turno** o directamente la **OT**.
5. Avanzar la OT hasta **control de calidad → finalizada → entregada**.
6. Emitir **factura** y registrar el **cobro en caja**.

### Revisión anual / renovación de oblea

1. Ver alerta en el **Dashboard** (o buscar el vehículo).
2. Contactar al cliente y agendar en **Agenda**.
3. Al llegar, **generar OT** desde el turno.
4. Ejecutar el trabajo y completar **control de calidad**.
5. Entregar, facturar y cobrar.

---

## 13. Roles (quién ve qué)

| Rol | Uso habitual | Guía corta |
|-----|----------------|------------|
| **Administrador** | Todo el sistema y configuración | [Administrador](guia-usuario/administrador.md) |
| **Supervisor** | Operación, aprobaciones, visión general | [Supervisor](guia-usuario/supervisor.md) |
| **Recepción** | Clientes, vehículos, turnos, alta de OT | [Recepción](guia-usuario/recepcion.md) |
| **Mecánico** | Sus órdenes, avance en taller | [Mecánico](guia-usuario/mecanico.md) |
| **Caja** | Cobros, movimientos, arqueo | [Caja](guia-usuario/caja.md) |
| **Depósito** | Productos y stock | [Depósito](guia-usuario/deposito.md) |

Si no ves un menú, es normal: depende del rol asignado.

---

## 14. Buenas prácticas

- Completá teléfono y email del cliente para avisos de vencimiento.
- No entregues el vehículo sin OT **finalizada** y control de calidad.
- Mantené al día las fechas de PH y oblea en el equipo GNC.
- Registrá señas y cobros en caja para no perder el rastro.
- Revisá el Dashboard al empezar el día (vencimientos + OTs activas).
