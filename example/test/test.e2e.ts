import { browser, $, expect } from '@wdio/globals'

describe('Nuxt Service', () => {
    it('should have started server', async () => {
        await browser.url('/')
        await expect(browser).toHaveTitle('Welcome to Nuxt!')
        await expect($('aria/Welcome to Nuxt!')).toBePresent()
    })
})
