import outdent from 'outdent'
import {PackageJson} from '../actions/verify/types'

export function defaultSourceJs(pkg: PackageJson) {
  return (
    outdent`
  import {createPlugin} from 'sanity'

  /**
   * ## Usage in sanity.config.js (or .js)
   *
   * \`\`\`
   * import {createConfig} from 'sanity'
   * import {myPlugin} from '${pkg.name}'
   *
   * export const createConfig({
   *     /...
   *     plugins: [
   *         myPlugin({})
   *     ]
   * })
   * \`\`\`
   */
  export const myPlugin = createPlugin((config = {}) => {
    // eslint-disable-next-line no-console
    console.log(\`hello from ${pkg.name}\`)
    return {
      name: '${pkg.name}',
    }
  })
`.trimStart() + '\n'
  )
}

export function defaultSourceTs(pkg: PackageJson) {
  return (
    outdent`
  import {createPlugin} from 'sanity'

  interface MyPluginConfig {
    /* nothing here yet */
  }

  /**
   * ## Usage in sanity.config.ts (or .js)
   *
   * \`\`\`
   * import {createConfig} from 'sanity'
   * import {myPlugin} from '${pkg.name}'
   *
   * export const createConfig({
   *     /...
   *     plugins: [
   *         myPlugin()
   *     ]
   * })
   * \`\`\`
   */
  export const myPlugin = createPlugin<MyPluginConfig | void>((config = {}) => {
    // eslint-disable-next-line no-console
    console.log('hello from ${pkg.name}')
    return {
      name: '${pkg.name}',
    }
  })
`.trimStart() + '\n'
  )
}
