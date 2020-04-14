const fs = require('fs')
const path = require('path')
const util = require('util')
const pAny = require('p-any')
const validateNpmPackageName = require('validate-npm-package-name')
const {buildExtensions} = require('../configs/buildExtensions')
const {getPaths} = require('../sanity/manifest')

const stat = util.promisify(fs.stat)
const readFile = util.promisify(fs.readFile)

const pathKeys = ['main', 'module', 'browser', 'types', 'typings']

module.exports = {getPackage, validatePackage}

async function getPackage(options) {
  validateOptions(options)

  const {basePath} = options
  const manifestPath = path.normalize(path.join(basePath, 'package.json'))

  let content
  try {
    content = await readFile(manifestPath, 'utf8')
  } catch (err) {
    throw new Error(`Failed to read "${manifestPath}": ${err.message}`)
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch (err) {
    throw new Error(`Error parsing "${manifestPath}": ${err.message}`)
  }

  await validatePackage(parsed, options)
  return parsed
}

async function validatePackage(manifest, opts = {}) {
  validateOptions(opts)

  const options = {isPlugin: true, ...opts}
  if (!isObject(manifest)) {
    throw new Error(`Invalid package.json: Root must be an object`)
  }

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

// I'm pretty sure I'll need this at some point, so leaving it around for now
// eslint-disable-next-line no-unused-vars
function getCompiledFilePath(file, paths) {
  // /plugin/src/MyComponent.tsx => MyComponent.tsx
  const input = path.basename(file)

  // /plugin/src/MyComponent.tsx => /plugin/src
  const inputPath = path.dirname(file)

  // MyComponent.tsx => .tsx
  const extension = path.extname(input)

  // MyComponent.tsx => MyComponent
  const withoutExtension = path.basename(input, extension)

  // .css, .md = false
  // .js, .tsx = true
  const isCompilable = buildExtensions.includes(extension)

  // MyComponent => MyComponent.js
  // styles.css  => styles.css
  const output = `${withoutExtension}${isCompilable ? '.js' : extension}`

  // MyComponent.js => /plugin/src/MyComponent.js
  const outputPath = path.join(inputPath, output)

  // /plugin/src/MyComponent.tsx => /plugin/lib/MyComponent.js
  return outputPath.replace(paths.source, paths.compiled)
}

function hasSourceEquivalent(file, paths) {
  // /plugin/lib/MyComponent.js => /plugin/src
  const baseDir = path.dirname(file.replace(paths.compiled, paths.source))

  // /plugin/lib/MyComponent.js => MyComponent
  const baseName = path.basename(file, path.extname(file))

  // MyComponent => /plugin/src/MyComponent
  const pathStub = path.join(baseDir, baseName)

  /*
   * /plugin/src/MyComponent => [
   *   /plugin/src/MyComponent.jsx,
   *   /plugin/src/MyComponent.mjs,
   *   ...
   * ]
   */
  const candidates = buildExtensions.map((ext) => `${pathStub}${ext}`)

  return pAny(candidates.map((candidate) => stat(candidate)))
    .then(() => true)
    .catch(() => false)
}

async function validatePaths(manifest, options) {
  const paths = await getPaths({...options, pluginName: manifest.name})
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
      throw new Error(
        paths
          ? `Invalid package.json: "${key}" points to file that does not exist, and "paths" is not configured to compile to this location`
          : `Invalid package.json: "${key}" points to file that does not exist`
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
