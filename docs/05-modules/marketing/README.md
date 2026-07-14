# Módulo: Marketing

## Estado: Pendiente

Tabla `campanas` existe en migraciones; **sin** service, controller ni pantallas.

## Responsabilidad (diseño objetivo)

Campañas de comunicación a clientes (vencimientos, promociones).

## Tablas

- `campanas` (presente en esquema; sin uso de aplicación)
- `campana_destinatarios` (futuro)
- `comunicacion_logs` (futuro)

## Canales previstos

Email, WhatsApp Business API, SMS

## Nota

Hasta implementar el módulo, las alertas de vencimiento viven en Dashboard (listado stub, sin envío).
