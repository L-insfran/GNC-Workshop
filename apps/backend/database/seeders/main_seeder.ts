import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { ROLES } from '@gnc/shared-types'
import Role from '#models/role'
import User from '#models/user'
import TipoTrabajo from '#models/tipo_trabajo'
import VehiculoMarca from '#models/vehiculo_marca'
import VehiculoModelo from '#models/vehiculo_modelo'

export default class MainSeeder extends BaseSeeder {
  async run() {
    const rolesData = [
      { name: ROLES.ADMINISTRADOR, displayName: 'Administrador', description: 'Acceso total al sistema' },
      { name: ROLES.SUPERVISOR, displayName: 'Supervisor', description: 'Supervisión operativa y reportes' },
      { name: ROLES.RECEPCION, displayName: 'Recepción', description: 'Alta de clientes y recepción de OT' },
      { name: ROLES.MECANICO, displayName: 'Mecánico', description: 'Ejecución de trabajos en taller' },
      { name: ROLES.CAJA, displayName: 'Caja', description: 'Cobros y movimientos de caja' },
      { name: ROLES.DEPOSITO, displayName: 'Depósito', description: 'Inventario y stock' },
      { name: ROLES.INVITADO, displayName: 'Invitado', description: 'Solo lectura limitada' },
    ]

    const roles: Role[] = []
    for (const roleData of rolesData) {
      const role = await Role.updateOrCreate({ name: roleData.name }, roleData)
      roles.push(role)
    }

    const adminRole = roles.find((role) => role.name === ROLES.ADMINISTRADOR)!

    // Password en texto plano: withAuthFinder hashea automáticamente al guardar.
    // No usar hash.make() acá (doble hash → login falla).
    const admin = await User.updateOrCreate(
      { email: 'admin@gnc.local' },
      {
        email: 'admin@gnc.local',
        password: 'Admin123!',
        fullName: 'Administrador GNC',
        phone: null,
        avatarUrl: null,
        isActive: true,
        lastLoginAt: null,
      }
    )

    await admin.related('roles').sync([adminRole.id])

    const tiposTrabajo = [
      { nombre: 'Instalación nueva', descripcion: 'Instalación de equipo GNC nuevo', duracionEstimadaHoras: 8 },
      { nombre: 'Revisión anual', descripcion: 'Revisión anual obligatoria ENARGAS', duracionEstimadaHoras: 2 },
      { nombre: 'Renovación de oblea', descripcion: 'Renovación de certificado de oblea GNC', duracionEstimadaHoras: 1 },
      { nombre: 'Prueba hidráulica', descripcion: 'PH de cilindros GNC', duracionEstimadaHoras: 4 },
      {
        nombre: 'Reparación / cambio de cilindro',
        descripcion: 'Reparación o reemplazo de cilindro',
        duracionEstimadaHoras: 3,
      },
      { nombre: 'Desinstalación', descripcion: 'Desinstalación de equipo GNC', duracionEstimadaHoras: 2 },
      { nombre: 'Conversión de regulador', descripcion: 'Cambio o conversión de regulador', duracionEstimadaHoras: 3 },
    ]

    for (const tipo of tiposTrabajo) {
      await TipoTrabajo.updateOrCreate({ nombre: tipo.nombre }, { ...tipo, isActive: true })
    }

    const marcasModelos = [
      { marca: 'Toyota', modelos: ['Corolla', 'Hilux', 'Etios'] },
      { marca: 'Ford', modelos: ['Fiesta', 'Focus', 'Ranger'] },
      { marca: 'Chevrolet', modelos: ['Onix', 'Cruze', 'S10'] },
      { marca: 'Volkswagen', modelos: ['Gol', 'Polo', 'Amarok'] },
      { marca: 'Fiat', modelos: ['Cronos', 'Argo', 'Toro'] },
    ]

    for (const item of marcasModelos) {
      const marca = await VehiculoMarca.updateOrCreate({ nombre: item.marca }, { nombre: item.marca })

      for (const modeloNombre of item.modelos) {
        await VehiculoModelo.updateOrCreate(
          { marcaId: marca.id, nombre: modeloNombre },
          { marcaId: marca.id, nombre: modeloNombre }
        )
      }
    }
  }
}
