import { test } from '@japa/runner'
import type { HttpContext } from '@adonisjs/core/http'
import RoleMiddleware from '#middleware/role_middleware'
import { ROLES } from '@gnc/shared-types'

function createMockContext(
  user: {
    id: string
    roles: { name: string }[]
  } | null,
): {
  ctx: HttpContext
  responseStatus: { code: number; body: unknown } | null
  nextCalled: boolean
  next: () => Promise<void>
} {
  let responseStatus: { code: number; body: unknown } | null = null
  let nextCalled = false

  const response = {
    unauthorized: (body: unknown) => {
      responseStatus = { code: 401, body }
      return response
    },
    forbidden: (body: unknown) => {
      responseStatus = { code: 403, body }
      return response
    },
  }

  const authUser = user
    ? {
        ...user,
        load: async () => {},
      }
    : null

  const ctx = {
    auth: { user: authUser },
    response,
  } as unknown as HttpContext

  const next = async () => {
    nextCalled = true
  }

  return {
    ctx,
    get responseStatus() {
      return responseStatus
    },
    get nextCalled() {
      return nextCalled
    },
    next,
  }
}

test.group('RoleMiddleware', () => {
  test('rejects unauthenticated requests', async ({ assert }) => {
    const middleware = new RoleMiddleware()
    const mock = createMockContext(null)

    await middleware.handle(mock.ctx, mock.next, [ROLES.ADMINISTRADOR])

    assert.isFalse(mock.nextCalled)
    assert.equal(mock.responseStatus?.code, 401)
  })

  test('rejects users without required role', async ({ assert }) => {
    const middleware = new RoleMiddleware()
    const mock = createMockContext({
      id: '1',
      roles: [{ name: ROLES.MECANICO }],
    })

    await middleware.handle(mock.ctx, mock.next, [ROLES.ADMINISTRADOR])

    assert.isFalse(mock.nextCalled)
    assert.equal(mock.responseStatus?.code, 403)
  })

  test('allows users with required role', async ({ assert }) => {
    const middleware = new RoleMiddleware()
    const mock = createMockContext({
      id: '1',
      roles: [{ name: ROLES.ADMINISTRADOR }],
    })

    await middleware.handle(mock.ctx, mock.next, [ROLES.ADMINISTRADOR])

    assert.isTrue(mock.nextCalled)
    assert.isNull(mock.responseStatus)
  })

  test('allows users with any of multiple allowed roles', async ({ assert }) => {
    const middleware = new RoleMiddleware()
    const mock = createMockContext({
      id: '1',
      roles: [{ name: ROLES.SUPERVISOR }],
    })

    await middleware.handle(mock.ctx, mock.next, [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR])

    assert.isTrue(mock.nextCalled)
  })
})
