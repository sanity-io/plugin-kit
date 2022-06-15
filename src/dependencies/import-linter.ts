import log from '../util/log'
import {mergedPackages} from '../configs/merged-packages'
import {urls} from '../constants'
import {ESLint} from 'eslint'
import path from 'path'
import outdent from 'outdent'

const removedImportSuffix = `imports where removed in Sanity v3. Please refer to the migration guide: ${urls.migrationGuideStudio}, or new API-reference docs: ${urls.refDocs}`

export async function validateImports({basePath}: {basePath: string}): Promise<string[]> {
  log.debug('Running ESLint with Sanity Studio import hints...')
  const eslint = new ESLint({
    cwd: basePath,
    overrideConfig: {
      ignorePatterns: ['node_modules'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              ...mergedPackages.map((packageName) => ({
                group: [`${packageName}*`],
                message: `Use sanity instead of ${packageName}.`,
              })),
              {
                group: ['config:*'],
                message: `config: imports are no longer supported. Please see the new plugin API for alternatives: ${urls.migrationGuideStudio}`,
              },
              {
                group: ['part:*'],
                message: `part: ${removedImportSuffix}`,
              },
              {
                group: ['all:part:*'],
                message: `all:part: ${removedImportSuffix}`,
              },
              {
                group: ['sanity:*'],
                message: `sanity: ${removedImportSuffix}`,
              },
            ],
          },
        ],
      },
    },
  })

  try {
    const results = await eslint.lintFiles([path.join(basePath, '**/*.{js,jsx,ts,tsx}')])

    const onlyImportErrors = results
      .map((r) => {
        const limitErrors = r.messages.filter((m) => m.ruleId === 'no-restricted-imports')
        return {
          ...r,
          messages: limitErrors,
          errorCount: limitErrors.length,
        }
      })
      .filter((r) => r.errorCount)

    if (onlyImportErrors.length) {
      const formatter = await eslint.loadFormatter('stylish')
      const resultText = await formatter.format(onlyImportErrors)

      const addtionalInfo = outdent`
        ESLint detected Studio V2 imports that are no longer available.
        It is recommended configure @sanity/eslint-config-no-v2-imports for ESLint.

        Run:
        npm install --save-dev @sanity/eslint-config-no-v2-imports

        In .eslintrc add:
        "extends": ["@sanity/no-v2-imports"]

        This way, V2-imports can be identified directly in the IDE, or using eslint CLI.
        For more, see ${urls.linterPackage}

        If the plugin package does not use eslint, disable this check.
    `
      return [resultText + addtionalInfo]
    }
  } catch (e) {
    log.error('Failed to run eslint check', e)
    return [
      outdent`
        Failed to run ESLint. Is ESLint configured?
        It is recommended to install eslint-config-sanity and add 'sanity/upgrade-v2' to your eslint-extends config.

        Run:
        npm install --save-dev eslint-config-sanity

        In .eslintrc add:
        extends: ['sanity/upgrade-v2']

        This way, V2-imports can be identified directly in the IDE, or using eslint CLI.
        If the package does not use eslint, disable this check.
    `,
    ]
  }

  return []
}
