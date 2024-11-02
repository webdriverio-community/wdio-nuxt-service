import { existsSync, readdirSync } from 'node:fs'

import logger from '@wdio/logger'
import getPort from 'get-port'
import chokidar, { type FSWatcher } from 'chokidar'
import { listen, type HTTPSOptions } from 'listhen'
import { setupDotenv } from 'c12'
import { toNodeListener } from 'h3'
import { withTrailingSlash } from 'ufo'
import { debounce } from 'perfect-debounce'
import { SevereServiceError } from 'webdriverio'
import { resolve, relative, normalize } from 'pathe'
import { loadNuxt, loadNuxtConfig, buildNuxt } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { AddressInfo } from 'node:net'
import type { RequestListener } from 'node:http'

import { pkg } from './constants.js'
import { writeNuxtManifest, loadNuxtManifest, cleanupNuxtDirs } from './utils.js'
import type { NuxtServiceOptions } from './types'

const log = logger('wdio-nuxt-service')

export class NuxtServiceLauncher {
    #options: Required<NuxtServiceOptions>
    #currentHandler?: RequestListener
    #currentNuxt?: Nuxt
    #distWatcher?: FSWatcher

    constructor (options: NuxtServiceOptions) {
        log.info(`Initiate Nuxt Service (v${pkg.version})`)
        this.#options = <Required<NuxtServiceOptions>>{
            rootDir: process.cwd(),
            dotenv: '.env',
            hostname: 'localhost',
            ...options
        }
    }

    public async onPrepare () {
        let loadingMessage = 'Nuxt is starting...'

        const loadingHandler: RequestListener = (_req, res) => {
            res.setHeader('Content-Type', 'text/html; charset=UTF-8')
            res.statusCode = 503 // Service Unavailable
            res.end('Loading Nuxt server...')
        }
        const serverHandler: RequestListener = (req, res) => (
            this.#currentHandler
                ? this.#currentHandler(req, res)
                : loadingHandler(req, res)
        )

        await setupDotenv({ cwd: this.#options.rootDir, fileName: this.#options.dotenv })
        const config = await loadNuxtConfig({
            cwd: this.#options.rootDir,
            overrides: { dev: true }
        })
        const runHTTPS = (this.#options.https !== false && (this.#options.https || config.devServer.https))
        const serverOptions = {
            showURL: false,
            port: this.#options.port || process.env.NUXT_PORT || config.devServer.port || await getPort(),
            hostname: this.#options.hostname || process.env.NUXT_HOST || config.devServer.host,
            https: runHTTPS
                ? {
                    cert: (
                        this.#options.sslCert
                        || (config.devServer.https && (config.devServer.https as HTTPSOptions).cert)
                        || undefined
                    ),
                    key: (
                        this.#options.sslKey
                        || (config.devServer.https && (config.devServer.https as HTTPSOptions).key)
                        || undefined
                    )
                } as HTTPSOptions
                : false
        }
        const listener = await listen(serverHandler, serverOptions)
        const showURL = () => {
            log.info(`Nuxt is ready at ${withTrailingSlash(listener.url.toString())}`)
        }
        const load = async (isRestart: boolean, reason?: string) => {
            try {
                loadingMessage = `${reason ? `${reason}. ` : ''}${isRestart ? 'Restarting' : 'Starting'} nuxt...`
                this.#currentHandler = undefined
                if (isRestart) {
                    log.info(loadingMessage)
                }
                if (this.#currentNuxt) {
                    await this.#currentNuxt.close()
                }
                if (this.#distWatcher) {
                    await this.#distWatcher.close()
                }

                const currentNuxt = this.#currentNuxt = await loadNuxt({
                    rootDir: this.#options.rootDir,
                    dev: true,
                    ready: false
                })
                currentNuxt.hooks.hookOnce('restart', () => load(true))

                if (!isRestart) {
                    showURL()
                }

                this.#distWatcher = chokidar.watch(
                    resolve(currentNuxt.options.buildDir, 'dist'),
                    { ignoreInitial: true, depth: 0 }
                )
                this.#distWatcher.on('unlinkDir', () => {
                    dLoad(true, '.nuxt/dist directory has been removed')
                })

                // Write manifest and also check if we need cache invalidation
                if (!isRestart) {
                    const previousManifest = await loadNuxtManifest(currentNuxt.options.buildDir)
                    const newManifest = await writeNuxtManifest(currentNuxt)
                    if (previousManifest && newManifest && previousManifest._hash !== newManifest._hash) {
                        await cleanupNuxtDirs(currentNuxt.options.rootDir)
                    }
                }

                await currentNuxt.ready()
                await currentNuxt.hooks.callHook('listen', listener.server, listener)
                const address = listener.server.address() as AddressInfo
                currentNuxt.options.devServer.url = listener.url
                currentNuxt.options.devServer.port = address.port
                currentNuxt.options.devServer.host = address.address
                currentNuxt.options.devServer.https = listener.https

                await buildNuxt(currentNuxt)
                process.env.WDIO_BASE_URL = listener.url
                this.#currentHandler = toNodeListener(currentNuxt.server.app)
                if (isRestart) {
                    showURL()
                }
            } catch (err) {
                const msg = `Cannot ${isRestart ? 'restart' : 'start'} nuxt: ${err.stack}`
                log.error(msg)
                this.#currentHandler = undefined
                throw new SevereServiceError(msg)
            }
        }

        // Watch for config changes
        // TODO: Watcher service, modules, and requireTree
        const dLoad = debounce(load)
        const watcher = chokidar.watch(this.#options.rootDir, { ignoreInitial: true, depth: 1 })
        watcher.on('all', (event, _file) => {
            if (!this.#currentNuxt) {
                return
            }
            const file = normalize(_file)
            const buildDir = withTrailingSlash(normalize(this.#currentNuxt.options.buildDir))
            if (file.startsWith(buildDir)) {
                return
            }
            const relativePath = relative(this.#options.rootDir, file)
            if (file.match(/(nuxt\.config\.(js|ts|mjs|cjs)|\.nuxtignore|\.env|\.nuxtrc)$/)) {
                dLoad(true, `${relativePath} updated`)
            }

            const isDirChange = ['addDir', 'unlinkDir'].includes(event)
            const isFileChange = ['add', 'unlink'].includes(event)
            const pagesDir = resolve(this.#currentNuxt.options.srcDir, this.#currentNuxt.options.dir.pages)
            const reloadDirs = ['components', 'composables', 'utils'].map(
                (d) => resolve(this.#currentNuxt?.options.srcDir as string, d)
            )

            if (isDirChange) {
                if (reloadDirs.includes(file)) {
                    dLoad(true, `Directory \`${relativePath}/\` ${event === 'addDir' ? 'created' : 'removed'}`)
                    return
                }
            }

            if (isFileChange) {
                if (file.match(/(app|error|app\.config)\.(js|ts|mjs|jsx|tsx|vue)$/)) {
                    dLoad(true, `\`${relativePath}\` ${event === 'add' ? 'created' : 'removed'}`)
                    return
                }
            }

            if (file.startsWith(pagesDir)) {
                const hasPages = existsSync(pagesDir) ? readdirSync(pagesDir).length > 0 : false
                if (this.#currentNuxt && !this.#currentNuxt.options.pages && hasPages) {
                    dLoad(true, 'Pages enabled')
                    return
                }
                if (this.#currentNuxt && this.#currentNuxt.options.pages && !hasPages) {
                    dLoad(true, 'Pages disabled')
                    return
                }
            }
        })

        await load(false)
    }

    public async onComplete () {
        log.info('Stop Nuxt server')
        this.#currentHandler = undefined
        await this.#currentNuxt?.close()
        await this.#distWatcher?.close()
    }
}
