import env from '#start/env'
import { defineConfig } from '@adonisjs/core/logger'
import type { InferLoggers } from '@adonisjs/core/types/logger'

/**
 * Logger sin pino-pretty para evitar dependencia extra en servidores Linux.
 * Logs van a stdout en formato JSON (estándar Pino).
 */
const loggerConfig = defineConfig({
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
    },
  },
})

export default loggerConfig

declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
