import { defineConfig } from '@adonisjs/core/http'

export default defineConfig({
  useAsyncLocalStorage: true,
  allowMethodSpoofing: false,
  subdomainOffset: 2,
  generateRequestId: true,
  trustProxy: true,
  etag: false,
  jsonpCallbackName: 'callback',
})
