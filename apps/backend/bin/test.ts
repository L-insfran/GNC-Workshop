import { Ignitor, prettyPrintError } from '@adonisjs/core'

const APP_ROOT = new URL('../', import.meta.url)

const ignitor = new Ignitor(APP_ROOT, { importer: (url) => import(url) })

ignitor.tap((app) => {
  app.booting(async () => {
    await import('#start/env')
  })
})

ignitor.testRunner().run().catch((error) => {
  process.exitCode = 1
  prettyPrintError(error)
})
