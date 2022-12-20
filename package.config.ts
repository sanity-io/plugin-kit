import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  bundles: [{source: './src/cli.ts', require: './dist/cli.js'}],
  runtime: 'node',
  tsconfig: 'tsconfig.dist.json',
})
