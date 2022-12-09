import outdent from 'outdent'
import {PackageJson} from '../actions/verify/types'

export function defaultSourceJs(pkg: PackageJson) {
  return (
    outdent`
  import {definePlugin} from 'sanity'

  /**
   * Usage in sanity.config.js (or .ts)
   *
   * \`\`\`js
   * import {defineConfig} from 'sanity'
   * import {myPlugin} from '${pkg.name}'
   *
   * export default defineConfig({
   *   // ...
   *   plugins: [
   *     myPlugin({}),
   *   ],
   * })
   * \`\`\`
   */
  export const myPlugin = definePlugin((config = {}) => {
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
  import {definePlugin} from 'sanity'

  interface MyPluginConfig {
    /* nothing here yet */
  }

  /**
   * Usage in sanity.config.ts (or .js)
   *
   * \`\`\`ts
   * import {defineConfig} from 'sanity'
   * import {myPlugin} from '${pkg.name}'
   *
   * export default defineConfig({
   *   // ...
   *   plugins: [
   *     myPlugin(),
   *   ],
   * })
   * \`\`\`
   */
  export const myPlugin = definePlugin<MyPluginConfig | void>((config = {}) => {
    // eslint-disable-next-line no-console
    console.log('hello from ${pkg.name}')
    return {
      name: '${pkg.name}',
    }
  })
`.trimStart() + '\n'
  )
}
