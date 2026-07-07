export function extractPgError(error: unknown): { code?: string; message: string } {
  const messages: string[] = []
  let code: string | undefined
  let current: unknown = error

  for (let depth = 0; depth < 6 && current; depth++) {
    if (typeof current !== 'object' || current === null) {
      break
    }

    if ('code' in current && typeof (current as { code?: unknown }).code === 'string') {
      code = (current as { code: string }).code
    }

    if ('message' in current && typeof (current as { message?: unknown }).message === 'string') {
      messages.push((current as { message: string }).message)
    }

    if ('cause' in current) {
      current = (current as { cause?: unknown }).cause
      continue
    }

    break
  }

  return { code, message: messages.join(' | ') }
}

export function isPgUniqueViolation(error: unknown): boolean {
  return extractPgError(error).code === '23505'
}

export function isPgUndefinedTable(error: unknown): boolean {
  const { code, message } = extractPgError(error)

  if (code === '42P01') {
    return true
  }

  return /relation ["']?ot_items["']? does not exist/i.test(message)
}

export function isOtItemsInfrastructureError(error: unknown): boolean {
  if (isPgUndefinedTable(error)) {
    return true
  }

  const { message } = extractPgError(error)
  return /ot_items/i.test(message) && /does not exist|no existe/i.test(message)
}
