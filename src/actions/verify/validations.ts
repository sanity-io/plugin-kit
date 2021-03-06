import outdent from 'outdent'
// @ts-expect-error missing types
import validateNpmPackageName from 'validate-npm-package-name'
// @ts-expect-error missing types
import findBabelConfig from 'find-babel-config'
import {incompatiblePluginPackage, urls} from '../../constants'
import {mergedPackages} from '../../configs/merged-packages'
import path from 'path'
import {fileExists, readFileContent, readJson5File} from '../../util/files'
import chalk from 'chalk'
import {CompilerOptions, PackageJson, SanityStudioJson, SanityV2Json, TsConfig} from './types'

export const expectedScripts = {
  prebuild: `plugin-kit verify-package --silent`,
  build: 'parcel build --no-cache',
  watch: 'parcel watch',
  'link-watch': 'plugin-kit link-watch',
  prepublishOnly: 'npm run build',
}
const expectedModulesFields = ['source', 'exports', 'main', 'module', 'files']
const expectedCompilerOptions = {
  jsx: 'preserve',
  moduleResolution: 'node',
  target: 'esnext',
  module: 'esnext',
  sourceMap: false,
  inlineSourceMap: false,
  esModuleInterop: true,
  skipLibCheck: true,
  isolatedModules: true,
  downlevelIteration: true,
  declaration: true,
  allowSyntheticDefaultImports: true,
  //outDir: 'lib',
  //baseUrl: '.',
  //checkJs: false,
}

export function validateNodeEngine(packageJson: PackageJson) {
  const nodeVersionRange = '>=14.0.0'
  if (packageJson.engines?.node !== nodeVersionRange) {
    return [
      outdent`
        Expected package.json to contain engines.node: ">=14.0.0" to ensure Studio compatible builds,
        but it was: ${packageJson.engines?.node}

        Please add the following to package.json:

        "engines": {
          "node": "${nodeVersionRange}"
        }`.trimStart(),
    ]
  }
}

export function validateModule(packageJson: PackageJson): string[] {
  const errors: string[] = []

  const missingFields = expectedModulesFields.filter((field) => !packageJson[field])

  if (missingFields.length) {
    errors.push(
      outdent`
        Expected source, exports, main, module and files entries in package.json, but ${missingFields.join(
          ', '
        )} where missing.

        Example:

        Given a plugin with entry-point in src/index.ts, using default parcel build command,
        package.json should contain the following entries to ensure that cjs and esm outputs are built into lib:

        "source": "./src/index.ts",
        "exports": {
          ".": {
            "require": "./lib/cjs/index.js",
            "default": "./lib/esm/index.js"
          }
        },
        "main": "./lib/cjs/index.js",
        "module": "./lib/esm/index.js",
        "types": "./lib/types/index.d.ts",
        "files": [
          "src",
          "lib"
        ],

        Refer to Parcel library targets for more: https://parceljs.org/features/targets/#library-targets
  `.trimStart()
    )
  }
  return errors
}

export function validateScripts(packageJson: PackageJson): string[] {
  const errors: string[] = []

  const divergentScripts = Object.entries(expectedScripts).filter(([key, expectedCommand]) => {
    const command = packageJson.scripts?.[key]
    // check for includes instead of equals to give some leniency in command params and such
    return !command || !command.includes(expectedCommand)
  })

  if (divergentScripts.length) {
    errors.push(
      outdent`
      The following script commands did not contain expected defaults: ${divergentScripts
        .map(([key]) => key)
        .join(', ')}

      This checks for that the commands-strings includes these terms.
      For example, this will validate ok:
      "prebuild": "npm run clean && ${expectedScripts.prebuild}",

      Please add the following to your package.json "scripts":

      ${divergentScripts.map(([key, value]) => `"${key}": "${value}"`).join(',\n')}
  `.trimStart()
    )
  }
  return errors
}

export async function validateTsConfig(tsConfig: TsConfig) {
  const errors: string[] = []
  const options = tsConfig.compilerOptions ?? {}
  const wrongEntries = Object.entries(expectedCompilerOptions).filter(([key, value]) => {
    const option = options[key as keyof CompilerOptions]
    return typeof value === 'string' && typeof option === 'string'
      ? value.toLowerCase() !== option?.toLowerCase()
      : value !== option
  })

  if (wrongEntries.length) {
    const expectedOutput = wrongEntries
      .map(([key, value]) => `"${key}": ${typeof value === 'string' ? `"${value}"` : value},`)
      .join('\n')

    errors.push(
      outdent`
        Recommended tsconfig.json compilerOptions missing:

        The following fields had unexpected values: [${wrongEntries.map(([key]) => key).join(', ')}]
        Expected to find these values:
        ${expectedOutput}

        Please update your tsconfig.json accordingly.
      `.trimStart()
    )
  }

  return errors
}

export function validateParcelDependency({devDependencies}: PackageJson): string[] {
  if (!devDependencies?.parcel) {
    return [
      outdent`
        package.json does not list parcel as a devDependency.

        Please add it by running 'npm install --save-dev parcel'.
    `.trimStart(),
    ]
  }
  return []
}

export function validateSanityDependencies(packageJson: PackageJson): string[] {
  const {dependencies, devDependencies, peerDependencies} = packageJson
  const allDependencies = {...dependencies, ...devDependencies, ...peerDependencies}

  const illegalDeps = Object.keys(allDependencies).filter((dep) => mergedPackages.includes(dep))
  const deps = new Set<string>(illegalDeps)
  const unique = [...deps.values()]
  if (unique.length) {
    return [
      outdent`
        package.json depends on "@sanity/*" packages that have moved into "sanity" package.

        The following dependencies should be replaced with "sanity":
        - ${unique.join('\n- ')}

        Refer to the reference docs to find replacement imports:
        ${urls.refDocs}
    `.trimStart(),
    ]
  }
  return []
}

export async function validateRollupConfig({basePath}: {basePath: string}) {
  const configpath = path.normalize(path.join(basePath, 'rollup.config.js'))

  if (await fileExists(configpath)) {
    return [
      outdent`
        Found rollup.config.js file. When using default parcel build command, this will have no effect.

        Delete the rollup.config.js file, or disable this check.
    `.trimStart(),
    ]
  }
  return []
}

export async function validateBabelConfig({basePath}: {basePath: string}) {
  const babelConfig: {file?: string} = await findBabelConfig(basePath)

  if (babelConfig.file) {
    return [
      outdent`
        Found babel-config file: ${babelConfig.file}. When using default parcel build command,
        this is probably not needed.

        Delete the ${babelConfig.file} file, or disable this check.
      `.trimStart(),
    ]
  }
  return []
}

export async function validateStudioConfig({basePath}: {basePath: string}): Promise<string[]> {
  const filenames = ['sanity.config.ts', 'sanity.config.js', 'sanity.cli.ts', 'sanity.cli.js']

  const files = await filenames.reduce(async (record, filename) => {
    // @ts-expect-error it works though
    record[filename] = await readFileContent({basePath, filename})
    return record
  }, Promise.resolve({} as Record<string, string | undefined>))

  const sanityJson = await readJson5File<SanityStudioJson>({basePath, filename: 'sanity.json'})

  const hasCliConfig = files['sanity.cli.ts'] || files['sanity.cli.js']
  const hasStudioConfig = files['sanity.config.ts'] || files['sanity.config.js']

  const errors: string[] = []

  if (sanityJson) {
    const info = [
      outdent`
        Found sanity.json. This file is not used by Sanity Studio V3.

        Please consult the Studio V3 migration guide:
         ${urls.migrationGuideStudio}
        It will detail how to convert sanity.json to sanity.config.ts (or .js) and sanity.cli.ts (or .js) equivalents.
      `.trimStart(),
      sanityJson.plugins?.length &&
        outdent`
        For V3 versions and alternatives to V2 plugins, please refer to the Sanity Exchange:
        ${urls.sanityExchange}
      `.trimStart(),
    ].filter((s): s is string => !!s)

    errors.push(info.join('\n\n'))
  }

  if (!hasCliConfig) {
    errors.push(
      outdent`
        sanity.cli.ts (or .js) missing. Please create a file named sanity.cli.ts with the following content:

        ${chalk.green(
          outdent`
        import {createCliConfig} from 'sanity/cli'

        export default createCliConfig({
          api: {
            projectId: '${sanityJson?.api?.projectId ?? 'project-id'}',
            dataset: '${sanityJson?.api?.dataset ?? 'dataset'}',
          }
        })`
        )}

        Make sure to replace the projectId and dataset fields with your own.

        For more, see ${urls.migrationGuideStudio}
    `.trimStart()
    )
  }

  if (!hasStudioConfig) {
    errors.push(
      outdent`
        sanity.config.ts (or .js) missing. At a minimum sanity.config.ts should contain:

        ${chalk
          .green(
            outdent`
            import { createConfig, createPlugin } from "sanity"
            import { deskTool } from "sanity/desk"

            export default createConfig({
              name: "default",

              projectId: '${sanityJson?.api?.projectId ?? 'project-id'}',
              dataset: '${sanityJson?.api?.dataset ?? 'dataset'}',

              plugins: [
                deskTool(),
              ],

              schema: {
                types: [
                  /* put your v2 schema-types here */
                ],
              },
            })`
          )
          .trimStart()}

        Make sure to replace the projectId and dataset fields with your own.

        For more, see ${urls.migrationGuideStudio}
    `.trimStart()
    )
  }

  return [errors.join(`\n\n---\n\n`)]
}

export async function validatePluginSanityJson({
  basePath,
  packageJson,
}: {
  basePath: string
  packageJson: PackageJson
}) {
  const sanityJson = await readJson5File<SanityV2Json>({basePath, filename: 'sanity.json'})

  const expectedDefaults = {
    parts: [
      {
        implements: 'part:@sanity/base/sanity-root',
        path: './v2-incompatible.js',
      },
    ],
  }

  const hasSinglePart =
    sanityJson &&
    Object.keys(sanityJson).length === 1 &&
    sanityJson?.parts &&
    sanityJson.parts.length === 1

  const firstPart = hasSinglePart ? sanityJson?.parts?.[0] : undefined
  const correctImplements = firstPart?.implements === expectedDefaults.parts[0].implements
  const pathExists =
    firstPart?.path && (await fileExists(path.normalize(path.join(basePath, firstPart.path))))
  const hasDependency = !!packageJson.dependencies?.[incompatiblePluginPackage]
  const isValid = sanityJson && hasSinglePart && correctImplements && pathExists && hasDependency

  if (!isValid) {
    const errors = [
      !sanityJson ? 'sanity.json does not exist' : null,
      !hasSinglePart ? 'sanity.json should have exactly one entry in "parts", but did not.' : null,
      !correctImplements
        ? `The part should implement ${expectedDefaults.parts[0].implements}, but did not.`
        : null,
      firstPart?.path && !pathExists
        ? `The file in "path", ${firstPart?.path}, does not exist.`
        : null,

      !hasDependency
        ? outdent`
      package.json should have ${incompatiblePluginPackage} as a dependency, but did not.
        Install it with: npm install --save ${incompatiblePluginPackage}
      `.trimStart()
        : null,
    ].filter((e): e is string => !!e)

    return [
      outdent`
        Invalid sanity.json. It is used for compatibility checking in V2 studios:

        - ${errors.join('\n- ')}

        sanity.json will only be used when incorrectly installing a v3 plugin in a v2 Studio.

        This check ensures that sanity.json conforms with the usage section of
        ${urls.incompatiblePlugin}
    `.trimStart(),
    ]
  }
  return []
}

export function validatePackageName(packageJson: PackageJson) {
  const valid: {validForNewPackages?: boolean; errors: string[]} = validateNpmPackageName(
    packageJson.name
  )
  if (!valid.validForNewPackages) {
    return [`Invalid package.json: "name" is invalid: ${valid.errors.join(', ')}`]
  }

  const isScoped = packageJson.name?.startsWith('@')
  if (!isScoped && !packageJson.name?.startsWith('sanity-plugin-')) {
    return [
      `Invalid package.json: "name" should be prefixed with "sanity-plugin-" (or scoped - @your-company/plugin-name)`,
    ]
  }
}
