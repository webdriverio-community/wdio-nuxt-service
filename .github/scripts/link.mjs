#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const LINKED_DIR = path.join(ROOT, 'node_modules', 'wdio-nuxt-service')

await fs.rm(LINKED_DIR, {
    recursive: true
}).catch((e) => console.warn(`Linked dir doesn't exists: ${e.message}`))
await fs.symlink(ROOT, LINKED_DIR)
