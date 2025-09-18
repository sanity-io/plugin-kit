import {outdent} from 'outdent'
import {InjectTemplate} from '../actions/inject'
import {InitFlags} from '../actions/init'

export function pkgConfigTemplate(options: {outDir: string; flags: InitFlags}): InjectTemplate {
  const {flags, outDir} = options

  return {
    type: 'template',
    force: flags.force,
    to: flags.typescript ? 'package.config.ts' : 'package.config.js',
    value: outdent`
      import {defineConfig} from '@sanity/pkg-utils'

      export default defineConfig({
        dist: '${outDir}',
        tsconfig: 'tsconfig.${outDir}.json',

        // Remove this block to enable strict export validation
        extract: {
          rules: {
            'ae-incompatible-release-tags': 'off',
            'ae-internal-missing-underscore': 'off',
            'ae-missing-release-tag': 'off',
          },
        },
      })
    `,
  }
}
