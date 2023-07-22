export interface NuxtServiceOptions {
    /**
     * root dir of the project
     * @default process.cwd()
     */
    rootDir?: string
    /**
     * environment file to be loaded before the server starts
     * @default .env
     */
    dotenv?: string
    /**
     * hostname to start the server on
     * @default localhost
     */
    hostname?: string
    /**
     * port to start the server on (random port picked if none provided)
     * @default process.env.NUXT_PORT || config.devServer.port
     */
    port?: number
    /**
     * set to true if test server should be started on https
     * (certificates need to be configured in Nuxt config)
     * @default false
     */
    https?: boolean
    /**
     * SSL certificate to be used for starting the server on https
     */
    sslCert?: string
    /**
     * SSL key to be used for starting the server on https
    */
    sslKey?: string
}
