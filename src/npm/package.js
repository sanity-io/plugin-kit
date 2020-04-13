const fs = require('fs')
const path = require('path')
const util = require('util')
const validateNpmPackageName = require('validate-npm-package-name')

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

  validatePackage(parsed, options)
  return parsed
}

function validatePackage(manifest, opts = {}) {
  validateOptions(opts)

  const options = {isPlugin: true, ...opts}
  if (!isObject(manifest)) {
    throw new Error(`Invalid package.json: Root must be an object`)
  }

  if (options.isPlugin) {
    validatePluginPackage(manifest, options)
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
function validatePluginPackage(manifest, options) {
  validatePackageName(manifest, options)
  validatePaths(manifest, options)
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

function validatePaths(manifest, options) {
  pathKeys.forEach((key) => {
    if (!(key in manifest)) {
      return
    }

    if (typeof manifest[key] !== 'string') {
      throw new Error(`Invalid package.json: "${key}" must be a string if defined`)
    }

    if (!fs.existsSync(path.join(options.basePath, manifest[key]))) {
      throw new Error(`Invalid package.json: "${key}" points to file that does not exist`)
    }
  })
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
