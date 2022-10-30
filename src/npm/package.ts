import fs from 'fs'
import path from 'path'
import util from 'util'
// @ts-expect-error missing types
import githubUrl from 'github-url-to-object'
// @ts-expect-error missing types
import validateNpmPackageName from 'validate-npm-package-name'
import {getPaths, ManifestOptions} from '../sanity/manifest'
import {resolveLatestVersions} from './resolveLatestVersions'
import {hasSourceEquivalent, writeJsonFile} from '../util/files'
import log from '../util/log'
import {cliName, incompatiblePluginPackage} from '../constants'
import {InjectOptions, PackageData} from '../actions/inject'
import {expectedScripts} from '../actions/verify/validations'
import {PackageJson} from '../actions/verify/types'
import {forcedPackageVersions} from '../configs/forced-package-versions'

const defaultDependencies = [incompatiblePluginPackage]

const defaultDevDependencies = ['rimraf', 'react', 'sanity']
const defaultPeerDependencies = ['react', 'sanity']

const readFile = util.promisify(fs.readFile)

const pathKeys: (keyof PackageJson)[] = ['main', 'module', 'browser', 'types', 'typings']

export async function getPackage(opts: ManifestOptions): Promise<PackageJson> {
  const options = {flags: {}, ...opts}

  validateOptions(options)

  const {basePath, validate = true} = options
  const manifestPath = path.normalize(path.join(basePath, 'package.json'))

  let content
  try {
    content = await readFile(manifestPath, 'utf8')
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `No package.json found. package.json is required to publish to npm. Use \`${cliName} init\` for a new plugin, or \`npm init\` for an existing one`
      )
    }

    throw new Error(`Failed to read "${manifestPath}": ${err.message}`)
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch (err: any) {
    throw new Error(`Error parsing "${manifestPath}": ${err.message}`)
  }

  if (!isObject(parsed)) {
    throw new Error(`Invalid package.json: Root must be an object`)
  }

  if (validate) {
    await validatePackage(parsed, options)
  }

  return parsed
}

export async function validatePackage(manifest: PackageJson, opts: ManifestOptions) {
  validateOptions(opts)

  const options = {isPlugin: true, ...opts}

  if (options.isPlugin) {
    await validatePluginPackage(manifest, options)
  }

  validateLockFiles(options)
}

function validateOptions(opts: {basePath: string}) {
  const options = opts || {}
  if (!isObject(options)) {
    throw new Error(`Options must be an object`)
  }

  if (typeof options.basePath !== 'string') {
    throw new Error(`"options.basePath" must be a string (path to plugin base path)`)
  }
}

async function validatePluginPackage(manifest: PackageJson, options: ManifestOptions) {
  validatePackageName(manifest)
  await validatePaths(manifest, options)
}

function validatePackageName(manifest: PackageJson) {
  if (typeof manifest.name !== 'string') {
    throw new Error(`Invalid package.json: "name" must be a string`)
  }

  const valid: {validForNewPackages?: boolean; errors: string[]} = validateNpmPackageName(
    manifest.name
  )
  if (!valid.validForNewPackages) {
    throw new Error(`Invalid package.json: "name" is invalid: ${valid.errors.join(', ')}`)
  }

  const isScoped = manifest.name[0] === '@'
  if (!isScoped && !manifest.name.startsWith('sanity-plugin-')) {
    throw new Error(
      `Invalid package.json: "name" should be prefixed with "sanity-plugin-" (or scoped - @your-company/plugin-name)`
    )
  }
}

async function validatePaths(manifest: PackageJson, options: ManifestOptions) {
  const paths = await getPaths({
    ...options,
    pluginName: manifest.name ?? 'unknown',
    verifySourceParts: false,
    verifyCompiledParts: false,
  })

  const abs = (file: string) =>
    path.isAbsolute(file) ? file : path.resolve(path.join(options.basePath, file))

  const exists = (file: string) => fs.existsSync(abs(file))
  const willExist = (file: string) => paths && hasSourceEquivalent(abs(file), paths)
  const withinSourceDir = (file: string) => paths?.source && abs(file).startsWith(paths.source)
  const withinTargetDir = (file: string) => paths?.compiled && abs(file).startsWith(paths.compiled)

  for (const key of pathKeys) {
    if (!(key in manifest)) {
      continue
    }

    const manifestValue = manifest[key]
    if (typeof manifestValue !== 'string') {
      throw new Error(`Invalid package.json: "${key}" must be a string if defined`)
    }

    // We don't want to reference `./src/MyComponent.js` containing a bunch of JSX and whatnot,
    // instead we want to target `./lib/MyComponent.js` which is the location it'll be compiled to
    if (!options?.flags?.allowSourceTarget && paths && withinSourceDir(manifestValue)) {
      throw new Error(
        `Invalid package.json: "${key}" points to file within source (uncompiled) directory. Use --allow-source-target if you really want to do this.`
      )
    }

    // Does it exist only because it was there prior to compilation?
    // We're clearing the folder on compilation, so we shouldn't allow it
    const fileExists = exists(manifestValue)
    if (
      fileExists &&
      paths &&
      withinTargetDir(manifestValue) &&
      !(await willExist(manifestValue))
    ) {
      throw new Error(
        `Invalid package.json: "${key}" points to file that will not exist after compiling`
      )
    }

    // If it _doesn't_ exist and it _won't_ exist, then there isn't much point in continuing, is there?
    if (!exists(manifestValue) && !(await willExist(manifestValue))) {
      if (!paths) {
        throw new Error(`Invalid package.json: "${key}" points to file that does not exist`)
      }

      const inOutDir = paths.compiled && !abs(manifestValue).startsWith(paths.compiled)
      throw new Error(
        inOutDir
          ? `Invalid package.json: "${key}" points to file that does not exist, and "paths" is not configured to compile to this location`
          : `Invalid package.json: "${key}" points to file that does not exist, and no equivalent is found in source directory`
      )
    }
  }
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return !Array.isArray(obj) && obj !== null && typeof obj === 'object'
}

function validateLockFiles(options: {basePath: string}) {
  const npm = fs.existsSync(path.join(options.basePath, 'package-lock.json'))
  const yarn = fs.existsSync(path.join(options.basePath, 'yarn.lock'))
  if (npm && yarn) {
    throw new Error(`Invalid plugin: contains both package-lock.json and yarn.lock`)
  }
}

export async function writePackageJson(data: PackageData, options: InjectOptions) {
  const {user, pluginName, license, description, pkg: prevPkg, gitOrigin} = data
  const {peerDependencies: addPeers, dependencies: addDeps, devDependencies: addDevDeps} = options
  const {flags} = options
  const prev = prevPkg || {}

  const usePrettier = flags.prettier !== false
  const useEslint = flags.eslint !== false
  const useTypescript = flags.eslint !== false

  const newDevDependencies = [cliName, 'parcel']

  if (useTypescript) {
    log.debug('Using TypeScript. Adding to dev dependencies.')
    newDevDependencies.push('typescript')
  }

  if (usePrettier) {
    log.debug('Using prettier. Adding to dev dependencies.')
    newDevDependencies.push('prettier')
  }

  if (useEslint) {
    log.debug('Using eslint. Adding to dev dependencies.')

    newDevDependencies.push(
      'eslint',
      'eslint-config-sanity',
      'eslint-plugin-react',
      'eslint-plugin-react-hooks'
    )

    if (usePrettier) {
      newDevDependencies.push('eslint-config-prettier', 'eslint-plugin-prettier')
    }

    if (useTypescript) {
      newDevDependencies.push('@typescript-eslint/eslint-plugin', '@typescript-eslint/parser')
    }
  }

  log.debug('Resolving latest versions for %s', newDevDependencies.join(', '))
  const dependencies = forceDependencyVersions({
    ...(prev.dependencies || {}),
    ...(addDeps || {}),
    ...(await resolveLatestVersions(defaultDependencies)),
  })
  const devDependencies = forceDependencyVersions({
    ...(addDevDeps || {}),
    ...(prev.devDependencies || {}),
    ...(await resolveLatestVersions([...newDevDependencies, ...defaultDevDependencies])),
  })
  console.log(devDependencies)
  const peerDependencies = forceDependencyVersions({
    ...(prev.peerDependencies || {}),
    ...(addPeers || {}),
    ...(await resolveLatestVersions(defaultPeerDependencies)),
  })

  const alwaysOnTop = {
    name: pluginName,
    version: prev.version ?? '1.0.0',
    description: description || '',
    author: user?.email ? `${user.name} <${user.email}>` : user?.name,
    license: license ? license.id : 'UNLICENSE',
  }

  const manifest: PackageJson = {
    ...alwaysOnTop,
    // Use already configured values by default
    ...(prev || {}),
    // but we override these to enforce standardization
    source: flags.typescript ? './src/index.ts' : './src/index.js',
    main: './lib/cjs/index.js',
    module: './lib/esm/index.js',
    types: './lib/types/index.d.ts',
    exports: {
      '.': {
        require: './lib/cjs/index.js',
        default: './lib/esm/index.js',
      },
    },
    files: ['src', 'lib', 'v2-incompatible.js', 'sanity.json'],
    engines: {
      node: '>=14.0.0',
    },
    scripts: {...prev.scripts},
    repository: {...prev.repository},

    // We're de-declaring properties because of key order in package.json
    ...alwaysOnTop,
    dependencies: sortKeys(dependencies),
    devDependencies: sortKeys(devDependencies),
    peerDependencies: sortKeys(peerDependencies),
    /* eslint-enable no-dupe-keys */

    ...repoFromOrigin(gitOrigin),
    ...urlsFromOrigin(gitOrigin),
  }

  // we use types, not typings
  delete manifest.typings

  const differs = JSON.stringify(prev) !== JSON.stringify(manifest)
  log.debug('Does manifest differ? %s', differs ? 'yes' : 'no')
  if (differs) {
    await writePackageJsonDirect(manifest, options)
  }

  return differs ? manifest : prev
}

function urlsFromOrigin(gitOrigin?: string): {bugs?: {url: string}; homepage?: string} {
  const details: {user: string; repo: string} | undefined = githubUrl(gitOrigin)
  if (!details) {
    return {}
  }

  return {
    bugs: {
      url: `https://github.com/${details.user}/${details.repo}/issues`,
    },
    homepage: `https://github.com/${details.user}/${details.repo}#readme`,
  }
}

function repoFromOrigin(gitOrigin?: string) {
  if (!gitOrigin) {
    return {}
  }

  return {
    repository: {
      type: 'git',
      url: gitOrigin,
    },
  }
}

export function addScript(cmd: string, existing: string) {
  if (existing && existing.includes(cmd)) {
    return existing
  }

  return cmd
}

export async function addPackageJsonScripts(
  manifest: PackageJson,
  options: InjectOptions,
  updateScripts: (currentScripts: Record<string, string>) => Record<string, string>
) {
  const originalScripts = manifest.scripts || {}
  const scripts = updateScripts({...originalScripts})

  const differs = Object.keys(scripts).some((key) => scripts[key] !== originalScripts[key])

  if (differs) {
    await writePackageJsonDirect({...manifest, scripts}, options)
  }

  return differs
}

export async function writePackageJsonDirect(manifest: PackageJson, {basePath}: InjectOptions) {
  await writeJsonFile(path.join(basePath, 'package.json'), manifest)
}

export async function addBuildScripts(manifest: PackageJson, options: InjectOptions) {
  if (!options.flags.scripts) {
    return false
  }
  return addPackageJsonScripts(manifest, options, (scripts) => {
    scripts.clean = addScript(`rimraf lib`, scripts.clean)
    scripts.lint = addScript(`eslint .`, scripts.lint)
    scripts.prebuild = addScript('npm run clean && ' + expectedScripts.prebuild, scripts.prebuild)
    scripts.build = addScript(expectedScripts.build, scripts.build)
    scripts.watch = addScript(expectedScripts.watch, scripts.watch)
    scripts['link-watch'] = addScript(expectedScripts['link-watch'], scripts['link-watch'])
    scripts.prepublishOnly = addScript(expectedScripts.prepublishOnly, scripts.prepublishOnly)
    return scripts
  })
}

export function sortKeys<T extends Record<string, unknown>>(unordered: T): T {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      // @ts-expect-error this WILL work
      obj[key] = unordered[key]
      return obj
    }, {} as T)
}

function forceDependencyVersions(deps: Record<string, string>): Record<string, string> {
  const entries = Object.entries(deps).map((entry) => {
    const [pkg] = entry
    const forceVersion = forcedPackageVersions[pkg as keyof typeof forcedPackageVersions]
    if (forceVersion) {
      return [pkg, forceVersion]
    }
    return entry
  })
  return Object.fromEntries(entries)
}
