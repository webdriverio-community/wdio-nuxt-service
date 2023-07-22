import type { Options } from '@wdio/types'

import { NuxtServiceLauncher } from './launcher.js'

export const launcher = NuxtServiceLauncher
export default class NuxtService {
    beforeSession (config: Options.Testrunner) {
        config.baseUrl = process.env.WDIO_BASE_URL
    }
}
