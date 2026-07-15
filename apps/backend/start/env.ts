import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),

  /** manual (default, asistido $0) | whatsapp_cloud (Meta API, futuro) */
  NOTIFICACION_DRIVER: Env.schema.enum.optional(['manual', 'whatsapp_cloud'] as const),
  WHATSAPP_CLOUD_TOKEN: Env.schema.string.optional(),
  WHATSAPP_CLOUD_PHONE_NUMBER_ID: Env.schema.string.optional(),
  WHATSAPP_CLOUD_API_VERSION: Env.schema.string.optional(),
  TALLER_NOMBRE: Env.schema.string.optional(),
})
