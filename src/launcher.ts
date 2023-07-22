import logger from '@wdio/logger'
import { SevereServiceError } from 'webdriverio'
import type { Options } from '@wdio/types'

import { pkg } from './constants.js'
import type { NuxtServiceOptions } from './types'

const log = logger('wdio-nuxt-service')

export class NuxtServiceLauncher {
    #options: Required<NuxtServiceOptions>
    #config: Options.Testrunner
    #server?: unknown

    constructor (options: NuxtServiceOptions, _: never, config: Options.Testrunner) {
        log.info(`Initiate Nuxt Service (v${pkg.version})`)
        this.#config = config
        this.#options = <Required<NuxtServiceOptions>>{
            configFile: 'nuxt.config.ts',
            configRoot: process.cwd(),
            mode: 'development',
            logLevel: 'info',
            ...options
        }
    }

    public async onPrepare (config: Options.Testrunner) {

    }

    public async onComplete () {
        if (this.#server) {
            // await this.#server.close()
        }
    }
}
