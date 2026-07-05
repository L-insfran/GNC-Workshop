import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { Secret } from '@adonisjs/core/helpers'
import { defineConfig } from '@adonisjs/core/http'

/**
 * Clave de aplicación para encriptación y tokens.
 */
export const appKey = new Secret(env.get('APP_KEY'))

/**
 * Configuración del servidor HTTP.
 */
export const http = defineConfig({
  generateRequestId: true,
  allowMethodSpoofing: false,
  useAsyncLocalStorage: true,
  trustProxy: true,
  etag: false,
  jsonpCallbackName: 'callback',
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },
})
