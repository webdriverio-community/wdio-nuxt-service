exports.launcher = class CJSNuxtServiceLauncher {
    private instance?: any

    constructor (options: any) {
        this.instance = import('../index.js').then((NuxtServiceLauncher) => (
            // eslint-disable-next-line new-cap, @typescript-eslint/no-unsafe-argument
            new NuxtServiceLauncher.launcher(options)
        ))
    }

    async onPrepare () {
        const instance = await this.instance
        return instance.beforeSession()
    }
}
