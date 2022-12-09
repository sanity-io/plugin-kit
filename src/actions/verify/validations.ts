import outdent from 'outdent'
// @ts-expect-error missing types
import validateNpmPackageName from 'validate-npm-package-name'
// @ts-expect-error missing types
import findBabelConfig from 'find-babel-config'
import {incompatiblePluginPackage, urls} from '../../constants'
import {deprecatedDevDeps, mergedPackages} from '../../configs/banned-packages'
import path from 'path'
import {fileExists, readJson5File} from '../../util/files'
import chalk from 'chalk'
import {PackageJson, SanityStudioJson, SanityV2Json} from './types'
import {ParsedCommandLine} from 'typescript'

export const expectedScripts = {
  prebuild: `plugin-kit verify-package --silent && pkg-utils`,
  build: 'pkg-utils build',
  watch: 'pkg-utils watch',
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
  rootDir: 'src',
  outDir: 'lib',
}

export function validateNodeEngine(packageJson: PackageJson) {
  const nodeVersionRange = '>=14'
  if (!packageJson.engines?.node?.startsWith(nodeVersionRange)) {
    return [
      outdent`
        Expected package.json to contain engines.node: ">=14" to ensure Studio compatible builds,
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

        Given a plugin with entry-point in src/index.ts, using default @sanity/pkg-utils build command,
        package.json should contain the following entries to ensure that commonjs and esm outputs are built into lib:

        "source": "./src/index.ts",
        "exports": {
          ".": {
            "types": "./lib/src/index.d.ts",
            "source": "./src/index.ts",
            "import": "./lib/index.esm.js",
            "require": "./lib/index.js",
            "default": "./lib/index.js"
          }
        },
        "main": "./lib/index.js",
        "module": "./lib/index.esm.js",
        "types": "./lib/src/index.d.ts",
        "files": [
          "src",
          "lib"
        ],

        Refer to @sanity/pkg-utils for more: https://github.com/sanity-io/pkg-utils#sanitypkg-utils
  `.trimStart()
    )
  }

  if (packageJson.typings) {
    errors.push(outdent`Found typings field in package.json. Use types instead.`)
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

export async function validateTsConfig(ts: ParsedCommandLine, options: {basePath: string}) {
  const errors: string[] = []

  const wrongEntries = Object.entries(expectedCompilerOptions).filter(([key, value]) => {
    let option: any = ts.options[key]

    if (key === 'rootDir' && typeof option === 'string') {
      option = path.relative(options.basePath, option) || '.'
    }

    if (key === 'outDir' && typeof option === 'string') {
      option = path.relative(options.basePath, option) || '.'
    }

    if (key === 'jsx' && option === 1) {
      option = 'preserve'
    }

    if (key === 'moduleResolution' && option === 2) {
      option = 'node'
    }

    if (key === 'target' && option === 99) {
      option = 'esnext'
    }

    if (key === 'module' && option === 99) {
      option = 'esnext'
    }

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

export function validatePkgUtilsDependency({devDependencies}: PackageJson): string[] {
  if (!devDependencies?.['@sanity/pkg-utils']) {
    return [
      outdent`
        package.json does not list @sanity/pkg-utils as a devDependency.
        @sanity/pkg-utils replaced parcel as the recommended build tool in @sanity/plugin-kit 2.0.0

        Please add it by running 'npm install --save-dev @sanity/pkg-utils'.
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

export function validateDeprecatedDependencies(packageJson: PackageJson): string[] {
  const {dependencies, devDependencies, peerDependencies} = packageJson
  const allDependencies = {...dependencies, ...devDependencies, ...peerDependencies}

  const illegalDeps = Object.keys(allDependencies).filter((dep) => deprecatedDevDeps.includes(dep))
  const deps = new Set<string>(illegalDeps)
  const unique = [...deps.values()]
  if (unique.length) {
    return [
      outdent`
        package.json contains deprecated dependencies that should be removed:
        - ${unique.join('\n- ')}
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
        Found babel-config file: ${babelConfig.file}. When using default @sanity/plugin-kit build command,
        this is probably not needed.

        Delete the ${babelConfig.file} file, or disable this check.
      `.trimStart(),
    ]
  }
  return []
}

export async function validateStudioConfig({basePath}: {basePath: string}): Promise<string[]> {
  const suffixes = ['ts', 'js', 'tsx', 'jsx']
  const withSuffix = (fileBases: string[]): string[] =>
    fileBases.flatMap((file) => suffixes.map((suffix) => `${file}.${suffix}`))

  const filenames = withSuffix(['sanity.config', 'sanity.cli'])

  const files: Record<string, boolean | undefined> = {}

  for (const filename of filenames) {
    const filepath = path.normalize(path.join(basePath, filename))
    files[filename] = await fileExists(filepath)
  }

  const sanityJson = await readJson5File<SanityStudioJson>({basePath, filename: 'sanity.json'})

  const hasConfigFile = (fileBase: string) =>
    withSuffix([fileBase]).some((filename) => files[filename])
  const hasCliConfig = hasConfigFile('sanity.cli')
  const hasStudioConfig = hasConfigFile('sanity.config')

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
        sanity.cli.(${suffixes.join(
          ' | '
        )}) missing. Please create a file named sanity.cli.ts with the following content:

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
        sanity.config.(${suffixes.join(
          ' | '
        )}) missing. At a minimum sanity.config.ts should contain:

        ${chalk
          .green(
            outdent`
            import { defineConfig } from "sanity"
            import { deskTool } from "sanity/desk"

            export default defineConfig({
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

  return errors.length ? [errors.join(`\n\n---\n\n`)] : []
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

export async function validateSrcIndexFile(basePath: string) {
  const paths = ['index.js', 'index.ts'].map((p) => path.join('src', p))
  const allowedIndexFiles = paths.map((file) => path.join(basePath, file))

  let hasIndex = false
  for (const indexFile of allowedIndexFiles) {
    hasIndex = hasIndex || (await fileExists(indexFile))
  }
  if (!hasIndex) {
    return [
      outdent`
      Expected one of [${paths.join(', ')}] to exist.

      @sanity/pkg-utils expects a non-jsx file to be the source entry-point for the plugin.
      If you currently have JSX in your index file, extract it into a separate file and import it.
      `,
    ]
  }

  return []
}
