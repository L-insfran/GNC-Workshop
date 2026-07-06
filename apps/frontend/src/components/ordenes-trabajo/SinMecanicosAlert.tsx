import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { ROUTES } from '@/constants/routes'

export function SinMecanicosAlert() {
  return (
    <Alert variant="warning">
      No hay mecánicos registrados en el sistema. Para operar órdenes de trabajo en taller debe
      existir al menos un usuario con rol Mecánico.{' '}
      <Link to={ROUTES.CONFIG_USUARIO_NEW} className="font-medium underline">
        Registrar mecánico
      </Link>
    </Alert>
  )
}
