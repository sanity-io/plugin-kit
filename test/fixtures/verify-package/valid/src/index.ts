import {definePlugin} from 'sanity'

interface MyPluginConfig {
  /* nothing here yet */
}

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {myPlugin} from 'sanity-plugin-test-plugin'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [myPlugin({})],
 * })
 * ```
 */
export const myPlugin = definePlugin<MyPluginConfig>((config = {}) => {
  // eslint-disable-next-line no-console
  console.log('hello from sanity-plugin-test-plugin')
  return {
    name: 'sanity-plugin-test-plugin',
  }
})
