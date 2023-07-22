<p align="center">
    <a href="https://webdriver.io/">
        <img alt="WebdriverIO loves Nuxt" src="https://raw.githubusercontent.com/webdriverio-community/wdio-nuxt-service/main/.github/assets/banner.png">
    </a>
</p>

# WDIO Nuxt Service [![Tests](https://github.com/webdriverio-community/wdio-nuxt-service/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/webdriverio-community/wdio-nuxt-service/actions/workflows/test.yml)

This service helps you to launch your application when using [Nuxt](https://nuxt.com/) as build tool. It automatically starts the Nuxt server using your `nuxt.conf.js` before launching the test.

## Installation

If you are getting started with WebdriverIO you can use the configuration wizard to set everything up:

```sh
npm init wdio@latest .
```

It will detect your project as a Nuxt project and will install all necessary plugins for you. If you are adding this service on an existing setup, you can always install it via:

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
            rootDir: './packages/nuxt'
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

### `rootDir`

Root directory of the project.

Type: `string`<br />
Default: _process.cwd()_

### `dotenv`

Environment file to be loaded before the server starts.

Type: `string`<br />
Default: _.env_

### `hostname`

Hostname to start the server on.

Type: `string`<br />
Default: _localhost_

### `port`

Port to start the server on.

Type: `number`<br />
Default: `process.env.NUXT_PORT || config.devServer.port`

### `https`

Set to true if test server should be started on https (certificates need to be configured in Nuxt config).

Type: `boolean`<br />
Default: `false`

### `sslCert`

SSL certificate to be used for starting the server on https.

Type: `string`

### `sslKey`

SSL key to be used for starting the server on https.

Type: `string`

----

For more information on WebdriverIO see the [homepage](https://webdriver.io).
