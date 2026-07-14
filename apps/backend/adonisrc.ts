import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  experimental: {
    mergeMultipartFieldsAndFiles: true,
    shutdownInReverseOrder: true,
  },
  directories: {
    config: 'config',
    public: 'public',
    providers: 'providers',
    start: 'start',
    tmp: 'tmp',
    views: 'resources/views',
  },
  /**
   * Relative paths for local commands (without extension). Ace will import .js on runtime.
   */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
    () => import('#commands/vencimientos_alertar'),
  ],
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/vinejs_provider'),
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/auth/auth_provider'),
    () => import('@adonisjs/bouncer/bouncer_provider'),
    () => import('#providers/app_provider'),
  ],
  preloads: [
    () => import('#start/kernel'),
    () => import('#start/events'),
    () => import('#start/routes'),
  ],
  metaFiles: [
    { pattern: 'public/**', reloadServer: false },
    { pattern: 'resources/views/**/*.edge', reloadServer: false },
  ],
  tests: {
    suites: [
      { files: ['tests/unit/**/*.spec.ts'], name: 'unit', timeout: 2000 },
      { files: ['tests/functional/**/*.spec.ts'], name: 'functional', timeout: 30000 },
    ],
    forceExit: false,
  },
})
