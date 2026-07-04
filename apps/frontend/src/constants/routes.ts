export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  CLIENTES: '/clientes',
  CLIENTE_NEW: '/clientes/nuevo',
  CLIENTE_DETAIL: (id: string) => `/clientes/${id}`,
  CLIENTE_EDIT: (id: string) => `/clientes/${id}/editar`,
  VEHICULOS: '/vehiculos',
  VEHICULO_NEW: '/vehiculos/nuevo',
  VEHICULO_EDIT: (id: string) => `/vehiculos/${id}/editar`,
  EQUIPOS_GNC: '/equipos-gnc',
  EQUIPO_GNC_NEW: '/equipos-gnc/nuevo',
  EQUIPO_GNC_EDIT: (id: string) => `/equipos-gnc/${id}/editar`,
  ORDENES_TRABAJO: '/ordenes-trabajo',
  ORDEN_TRABAJO_NEW: '/ordenes-trabajo/nuevo',
  ORDEN_TRABAJO_DETAIL: (id: string) => `/ordenes-trabajo/${id}`,
  ORDEN_TRABAJO_EDIT: (id: string) => `/ordenes-trabajo/${id}/editar`,
} as const

export type RouteKey = keyof typeof ROUTES
