import { test } from '@japa/runner'
import { ApiResponse } from '#shared/api_response'

test.group('ApiResponse', () => {
  test('success returns correct shape', ({ assert }) => {
    const result = ApiResponse.success({ id: '1' })
    assert.isTrue(result.success)
    assert.deepEqual(result.data, { id: '1' })
  })

  test('error returns correct shape', ({ assert }) => {
    const result = ApiResponse.error('NOT_FOUND', 'Resource not found')
    assert.isFalse(result.success)
    assert.equal(result.error?.code, 'NOT_FOUND')
    assert.equal(result.error?.message, 'Resource not found')
  })

  test('paginated returns data and meta', ({ assert }) => {
    const meta = { page: 1, perPage: 20, total: 100, lastPage: 5 }
    const result = ApiResponse.paginated([{ id: '1' }], meta)
    assert.isTrue(result.success)
    assert.lengthOf(result.data!, 1)
    assert.deepEqual(result.meta, meta)
  })
})
