import {getPackage} from '../npm/package'
import log from '../util/log'
import {cliName, urls} from '../constants'
import {validateImports} from '../dependencies/import-linter'
import outdent from 'outdent'
import {
  createValidator,
  runTscMaybe,
  VerifyFlags,
  VerifyPackageConfig,
} from './verify/verify-common'
import {readJson5File} from '../util/files'
import {
  validateBabelConfig,
  validateModule,
  validateNodeEngine,
  validatePackageName,
  validatePkgUtilsDependency,
  validatePluginSanityJson,
  validateDeprecatedDependencies,
  validateScripts,
  validateTsConfig,
  validateSanityDependencies,
  validateSrcIndexFile,
} from './verify/validations'
import {PackageJson, TsConfig} from './verify/types'
import chalk from 'chalk'

export async function verifyPackage({basePath, flags}: {basePath: string; flags: VerifyFlags}) {
  let errors: string[] = []

  const packageJson: PackageJson = await getPackage({basePath, validate: false})
  const verifyConfig: VerifyPackageConfig = packageJson.sanityPlugin?.verifyPackage || {}

  const validation = createValidator(verifyConfig, flags, errors)

  const tsConfig = await readJson5File<TsConfig>({basePath, filename: 'tsconfig.json'})

  await validation('packageName', async () => validatePackageName(packageJson))
  await validation('pkg-utils', async () => validatePkgUtilsDependency(packageJson))
  await validation('srcIndex', async () => validateSrcIndexFile(basePath))
  await validation('scripts', async () => validateScripts(packageJson))
  await validation('module', async () => validateModule(packageJson))
  await validation('nodeEngine', async () => validateNodeEngine(packageJson))

  tsConfig && (await validation('tsconfig', async () => validateTsConfig(tsConfig)))

  await validation('sanityV2Json', async () => validatePluginSanityJson({basePath, packageJson}))

  await validation('babelConfig', async () => validateBabelConfig({basePath}))

  await validation('dependencies', async () => validateSanityDependencies(packageJson))
  await validation('dependencies', async () => validateDeprecatedDependencies(packageJson))
  await validation('eslintImports', async () => validateImports({basePath}))

  if (errors.length) {
    throw new Error(
      outdent`
        Detected validation issues!
        To make this package Sanity v3 compatible, fix the issues starting from the top, or disable any checks you deem unnecessary.

        These issues assume the package uses @sanity/plugin-kit defaults for development and building.
        Refer to ${urls.pluginReadme} for configuration options.

        More information is available here:
        - Studio migration guide: ${urls.migrationGuideStudio}
        - Plugin migration guide: ${urls.migrationGuidePlugin}
        - Reference documentation: ${urls.refDocs}

        ${chalk.grey(
          `To fail-fast on first detected issue run:\nnpx ${cliName} verify-package' --single`
        )}
      `.trimStart()
    )
  }

  await runTscMaybe(verifyConfig, tsConfig)

  log.success(
    outdent`
    No outstanding upgrade issues detected.

    Suggested next steps:
      - Use plugin-kit to build and develop the plugin according to ${urls.pluginReadme}.
      - Build the plugin and fix any compilation errors
      - Test the plugin using the link-watch command
  `.trim()
  )
}
