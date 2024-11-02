exports.launcher = class CJSNuxtServiceLauncher {
    private instance?: any

    constructor (options: any) {
        this.instance = import('../index.js').then((NuxtServiceLauncher) => (
            new NuxtServiceLauncher.launcher(options)
        ))
    }

    async onPrepare () {
        const instance = await this.instance
        return instance.beforeSession()
    }
}
