const fs = require('fs')
const path = require('path')
const util = require('util')
const githubUrl = require('github-url-to-object')
const validateNpmPackageName = require('validate-npm-package-name')
const pkg = require('../../package.json')
const {getPaths} = require('../sanity/manifest')
const {resolveLatestVersions} = require('./resolveLatestVersions')
const {hasSourceEquivalent, writeJsonFile} = require('../util/files')
const prettierConfig = require('../assets/splat/prettier.config')
const eslintConfig = require('../assets/splat/eslint.config')
const log = require('../util/log')

const readFile = util.promisify(fs.readFile)

const pathKeys = ['main', 'module', 'browser', 'types', 'typings']

module.exports = {
  getPackage,
  validatePackage,
  getReferencedPaths,
  writePackageJson,
  addBuildScripts,
}

async function getPackage(opts) {
  const options = {flags: {}, ...opts}

  validateOptions(options)

  const {basePath, validate = true} = options
  const manifestPath = path.normalize(path.join(basePath, 'package.json'))

  let content
  try {
    content = await readFile(manifestPath, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `No package.json found. package.json is required to publish to npm. Use \`${pkg.binname} init\` for a new plugin, or \`npm init\` for an existing one`
      )
    }

    throw new Error(`Failed to read "${manifestPath}": ${err.message}`)
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch (err) {
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

async function validatePackage(manifest, opts = {}) {
  validateOptions(opts)

  const options = {isPlugin: true, ...opts}

  if (options.isPlugin) {
    await validatePluginPackage(manifest, options)
  }

  validateLockFiles(options)
}

function validateOptions(opts) {
  const options = opts || {}
  if (!isObject(options)) {
    throw new Error(`Options must be an object`)
  }

  if (typeof options.basePath !== 'string') {
    throw new Error(`"options.basePath" must be a string (path to plugin base path)`)
  }
}

async function validatePluginPackage(manifest, options) {
  validatePackageName(manifest, options)
  await validatePaths(manifest, options)
}

function validatePackageName(manifest, options) {
  if (typeof manifest.name !== 'string') {
    throw new Error(`Invalid package.json: "name" must be a string`)
  }

  const valid = validateNpmPackageName(manifest.name)
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

async function validatePaths(manifest, options) {
  const paths = await getPaths({
    ...options,
    pluginName: manifest.name,
    verifySourceParts: false,
    verifyCompiledParts: false,
  })

  const abs = (file) =>
    path.isAbsolute(file) ? file : path.resolve(path.join(options.basePath, file))

  const exists = (file) => fs.existsSync(abs(file))
  const willExist = (file) => paths && hasSourceEquivalent(abs(file), paths)
  const withinSourceDir = (file) => paths && abs(file).startsWith(paths.source)
  const withinTargetDir = (file) => paths && abs(file).startsWith(paths.compiled)

  for (const key of pathKeys) {
    if (!(key in manifest)) {
      continue
    }

    if (typeof manifest[key] !== 'string') {
      throw new Error(`Invalid package.json: "${key}" must be a string if defined`)
    }

    // We don't want to reference `./src/MyComponent.js` containing a bunch of JSX and whatnot,
    // instead we want to target `./lib/MyComponent.js` which is the location it'll be compiled to
    if (!options.flags.allowSourceTarget && paths && withinSourceDir(manifest[key])) {
      throw new Error(
        `Invalid package.json: "${key}" points to file within source (uncompiled) directory. Use --allow-source-target if you really want to do this.`
      )
    }

    // Does it exist only because it was there prior to compilation?
    // We're clearing the folder on compilation, so we shouldn't allow it
    const fileExists = exists(manifest[key])
    if (
      fileExists &&
      paths &&
      withinTargetDir(manifest[key]) &&
      !(await willExist(manifest[key]))
    ) {
      throw new Error(
        `Invalid package.json: "${key}" points to file that will not exist after compiling`
      )
    }

    // If it _doesn't_ exist and it _won't_ exist, then there isn't much point in continuing, is there?
    if (!exists(manifest[key]) && !(await willExist(manifest[key]))) {
      if (!paths) {
        throw new Error(`Invalid package.json: "${key}" points to file that does not exist`)
      }

      const inOutDir = !abs(manifest[key]).startsWith(paths.compiled)
      throw new Error(
        inOutDir
          ? `Invalid package.json: "${key}" points to file that does not exist, and "paths" is not configured to compile to this location`
          : `Invalid package.json: "${key}" points to file that does not exist, and no equivalent is found in source directory`
      )
    }
  }
}

function isObject(obj) {
  return !Array.isArray(obj) && obj !== null && typeof obj === 'object'
}

function validateLockFiles(options) {
  const npm = fs.existsSync(path.join(options.basePath, 'package-lock.json'))
  const yarn = fs.existsSync(path.join(options.basePath, 'yarn.lock'))
  if (npm && yarn) {
    throw new Error(`Invalid plugin: contains both package-lock.json and yarn.lock`)
  }
}

function getReferencedPaths(packageJson, basePath) {
  return pathKeys
    .filter((key) => key in packageJson)
    .map((key) =>
      path.isAbsolute(packageJson[key])
        ? packageJson[key]
        : path.resolve(basePath, packageJson[key])
    )
}

async function writePackageJson(data, options) {
  const {user, pluginName, license, description, pkg: prevPkg, gitOrigin} = data
  const {peerDependencies: addPeers, dependencies: addDeps, devDependencies: addDevDeps} = options
  const {basePath, flags} = options
  const prev = prevPkg || {}

  const usePrettier = flags.prettier !== false
  const useEslint = flags.eslint !== false

  const configs = {}
  const newDevDependencies = [pkg.name]

  if (usePrettier) {
    log.debug('Using prettier. Adding to dev dependencies.')
    newDevDependencies.push('prettier')
    configs.prettier = prev.prettier || prettierConfig
  }

  if (useEslint) {
    log.debug('Using eslint. Adding to dev dependencies.')
    const addEslint =
      !prev.eslintConfig ||
      JSON.stringify(prev.eslintConfig.extends) === JSON.stringify(eslintConfig.extends)

    if (addEslint) {
      newDevDependencies.push(
        'eslint',
        'eslint-config-prettier',
        'eslint-config-sanity',
        'eslint-plugin-react'
      )
    }

    configs.eslintConfig = prev.eslintConfig || eslintConfig
  }

  log.debug('Resolving latest versions for %s', newDevDependencies.join(', '))
  const devDependencies = {
    ...(addDevDeps || {}),
    ...(prev.devDependencies || {}),
    ...(await resolveLatestVersions(newDevDependencies)),
  }

  const manifest = {
    name: '',
    version: '1.0.0',
    description: '',
    main: 'lib/YourPlugin.js',
    scripts: {},
    repository: {},
    keywords: [],
    author: '',
    license: '',

    dependencies: {},
    devDependencies: {},
    peerDependencies: {},

    // Use already configured values by default
    ...(prev || {}),

    // We're de-declaring properties because of key order in package.json
    /* eslint-disable no-dupe-keys */
    name: pluginName,
    description: description || '',
    author: user.email ? `${user.name} <${user.email}>` : user.name,
    license: license ? license.id : 'UNLICENSE',
    keywords: withSanityKeywords(prev.keywords || []),
    devDependencies,
    dependencies: {...(prev.dependencies || {}), ...(addDeps || {})},
    peerDependencies: {...(prev.peerDependencies || {}), ...(addPeers || {})},
    /* eslint-enable no-dupe-keys */

    ...repoFromOrigin(gitOrigin),
    ...urlsFromOrigin(gitOrigin),

    // Config stuff
    ...configs,
  }

  const differs = JSON.stringify(prev) !== JSON.stringify(manifest)
  log.debug('Does manifest differ? %s', differs ? 'yes' : 'no')
  if (differs) {
    await writeJsonFile(path.join(basePath, 'package.json'), manifest)
  }

  return differs ? manifest : prev
}

function urlsFromOrigin(gitOrigin) {
  const details = githubUrl(gitOrigin)
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

function repoFromOrigin(gitOrigin) {
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

function withSanityKeywords(keywords = []) {
  const newKeywords = new Set(keywords)
  newKeywords.add('sanity')
  newKeywords.add('sanity-plugin')
  return Array.from(newKeywords)
}

function addScript(cmd, existing) {
  if (existing && existing.includes(cmd)) {
    return existing
  }

  return existing ? `${existing} && ${cmd}` : cmd
}

async function addBuildScripts(manifest, {basePath}) {
  const originalScripts = manifest.scripts || {}
  const scripts = {...originalScripts}
  scripts.build = addScript(`${pkg.binname} build`, scripts.build)
  scripts.watch = addScript(`${pkg.binname} build --watch`, scripts.watch)
  scripts.prepublishOnly = addScript(`${pkg.binname} build`, scripts.prepublishOnly)
  scripts.prepublishOnly = addScript(`${pkg.binname} verify`, scripts.prepublishOnly)

  const differs = Object.keys(scripts).some((key) => scripts[key] !== originalScripts[key])

  if (differs) {
    await writeJsonFile(path.join(basePath, 'package.json'), {...manifest, scripts})
  }

  return differs
}
