import {createPlugin} from 'sanity'

interface MyPluginConfig {
  /* nothing here yet */
}

/**
 * ## Usage in sanity.config.ts (or .js)
 *
 * ```
 * import {createConfig} from 'sanity'
 * import {myPlugin} from 'sanity-plugin-test-plugin'
 *
 * export const createConfig({
 *     /...
 *     plugins: [
 *         myPlugin({})
 *     ]
 * })
 * ```
 */
export const myPlugin = createPlugin<MyPluginConfig>((config = {}) => {
  // eslint-disable-next-line no-console
  console.log('hello from sanity-plugin-test-plugin')
  return {
    name: 'sanity-plugin-test-plugin',
  }
})
