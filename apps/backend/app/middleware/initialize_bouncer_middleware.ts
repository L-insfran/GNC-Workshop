import { Bouncer } from '@adonisjs/bouncer'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import * as abilities from '#abilities/main'

const policies = {}

export default class InitializeBouncerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.bouncer = new Bouncer(() => ctx.auth.user || null, abilities, policies).setContainerResolver(
      ctx.containerResolver
    )

    return next()
  }
}
