import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  bundles: [{source: './src/cli.ts', require: './lib/cli.js'}],
  dist: 'lib',
  runtime: 'node',
  tsconfig: 'tsconfig.lib.json',
})
