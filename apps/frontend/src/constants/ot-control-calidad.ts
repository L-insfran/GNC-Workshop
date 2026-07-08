import type { OtControlCalidadCheckKey } from '@gnc/shared-types'

export const OT_CONTROL_CALIDAD_CHECKS: Array<{
  key: OtControlCalidadCheckKey
  label: string
}> = [
  { key: 'sinFugas', label: 'Sin fugas detectadas' },
  { key: 'presionReguladorOk', label: 'Presión de regulador dentro de rango' },
  { key: 'valvulasSeguridadOk', label: 'Válvulas de seguridad operativas' },
  { key: 'estanqueidadOk', label: 'Prueba de estanqueidad aprobada' },
  { key: 'documentacionCompleta', label: 'Documentación y etiquetas en orden' },
]
