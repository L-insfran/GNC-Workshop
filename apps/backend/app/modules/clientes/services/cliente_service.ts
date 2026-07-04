import type { CreateClienteDTO } from '@gnc/shared-types'
import type User from '#models/user'
import type Cliente from '#models/cliente'
import { BaseService } from '#shared/base_service'
import ClienteRepository from '#modules/clientes/repositories/cliente_repository'

export default class ClienteService extends BaseService<Cliente> {
  protected entityType = 'cliente'
  protected repository = new ClienteRepository()

  async create(data: CreateClienteDTO, user: User): Promise<Cliente> {
    const existing = await this.repository.findByDocumento(data.documentoNumero)
    if (existing) {
      throw new Error('DOCUMENTO_DUPLICADO')
    }

    return super.create(
      {
        ...data,
        isActive: true,
        createdBy: user.id,
      },
      user
    )
  }
}
