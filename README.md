<p align="center">
    <a href="https://webdriver.io/">
        <img alt="WebdriverIO loves Nuxt" src="https://raw.githubusercontent.com/webdriverio-community/wdio-nuxt-service/main/.github/assets/banner.png">
    </a>
</p>

# WDIO Nuxt Service [![Tests](https://github.com/webdriverio-community/wdio-nuxt-service/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/webdriverio-community/wdio-nuxt-service/actions/workflows/test.yml)

This service helps you to launch your application when using [Nuxt](https://nuxt.com/) as build tool. It automatically starts the Nuxt server using your `nuxt.conf.js` before launching the test.

## Installation

```bash
npm install wdio-nuxt-service --save-dev
```

## Configuration

To enable the service, just add it to your `services` list in your `wdio.conf.js` file, e.g.:

```js
// wdio.conf.js
export const config = {
    // ...
    services: ['nuxt'],
    // ...
};
```

You can apply service option by passing in an array with a config object, e.g.:

```js
// wdio.conf.js
export const config = {
    // ...
    services: [
        ['nuxt', {
            configFile: './custom.nuxt.conf.ts'
        }]
    ],
    // ...
};
```

## Usage

If your config is set up accordingly, the service will set the [`baseUrl`](https://webdriver.io/docs/configuration#baseurl) option to point to your application. You can navigate to it via the [`url`](https://webdriver.io/docs/api/browser/url) command, e.g.:

```ts
await browser.url('/')
await expect(browser).toHaveTitle('Welcome to Nuxt!')
await expect($('aria/Welcome to Nuxt!')).toBePresent()
```

## Options

### `configFile`

Path to config file.

Type: `string`<br />
Default: _nuxt.config.ts_

----

For more information on WebdriverIO see the [homepage](https://webdriver.io).
