const path = require('path')
const spdxLicenseIds = require('spdx-license-ids')
const log = require('../util/log')
const {fileExists, uselessFiles, readJsonFile} = require('../util/files')
const {readManifest, getReferencesPartPaths} = require('../sanity/manifest')
const {getPackage, getReferencedPaths} = require('../npm/package')
const {getPublishableFiles} = require('../npm/publish')
const {findDependencies} = require('../dependencies/find')

module.exports = async function verify({basePath, flags}) {
  const pkg = await getPackage({basePath, flags})
  const manifest = await readManifest({
    basePath,
    pluginName: pkg.name,
    flags,
    verifyCompiledParts: true,
    verifySourceParts: true,
  })

  // Get all files intended to be published from npm
  const publishableFiles = await getPublishableFiles(basePath)

  // Errors
  await verifyPublishableFiles({basePath, pkg, manifest, publishableFiles})
  await verifyLicenseKey(pkg)
  await verifyPluginConfig(basePath)
  await verifyImports({pkg, manifest, basePath})

  // Warnings
  const hasWarnings = await warnOnUselessFiles(publishableFiles)

  // Huzzah
  log.success(
    hasWarnings
      ? 'Plugin has warnings, but looks good to publish!'
      : 'Plugin looks good to publish!'
  )
}

async function verifyPublishableFiles({pkg, manifest, basePath, publishableFiles}) {
  // Validate that these files exists, not just that they are publishable
  if (!(await fileExists(path.resolve(basePath, 'README.md')))) {
    throw new Error(
      `This plugin does not contain a README.md, which is required for Sanity plugins.`
    )
  }

  const [hasLicense, hasLicenseMd] = await Promise.all([
    fileExists(path.resolve(basePath, 'LICENSE')),
    fileExists(path.resolve(basePath, 'LICENSE.md')),
  ])

  if (!hasLicense && !hasLicenseMd) {
    throw new Error(
      `This plugin does not contain a LICENSE-file, which is required for Sanity plugins.`
    )
  }

  // Always, uhm... "kindly suggest", to include these files
  const files = ['README.md']
    // Get files from parts as well as the ones references in package.json
    .concat(getReferencesPartPaths(manifest, basePath), getReferencedPaths(pkg, basePath))
    // Make all paths relative to base path
    .map((file) =>
      path.relative(basePath, path.isAbsolute(file) ? file : path.resolve(basePath, file))
    )
    // Remove duplicates
    .filter((file, index, arr) => arr.indexOf(file, index + 1) === -1)

  // Verify that all explicitly referenced files are publishable
  const unpublishable = files.filter((file) => !publishableFiles.includes(file))

  // Warn with "default error" for unknowns
  const unknowns = unpublishable.filter((item) => item !== 'README.md').map((file) => `"${file}"`)

  if (unknowns.length > 0) {
    const paths = unknowns.join(', ')
    throw new Error(
      `This plugin references files that are ignored from being published: ${paths}. Check .gitignore, .npmignore and/or the "files" property of package.json. See https://docs.npmjs.com/using-npm/developers.html#keeping-files-out-of-your-package for more information.`
    )
  }
}

function verifyLicenseKey(pkg) {
  if (!pkg.license) {
    throw new Error(
      `package.json is missing "license" key: see https://docs.npmjs.com/files/package.json#license and make sure it matches your "LICENSE" file. See https://choosealicense.com/ for help on choosing a license.`
    )
  }

  if (pkg.license !== 'UNLICENSED' && !spdxLicenseIds.includes(pkg.license)) {
    throw new Error(
      `package.json has an invalid "license" key: it should be either an SPDX license ID (https://spdx.org/licenses/) or "UNLICENSE". See https://docs.npmjs.com/files/package.json#license and refer to https://choosealicense.com/ for help on choosing a license.`
    )
  }
}

async function verifyPluginConfig(basePath) {
  const configPath = path.join(basePath, 'config.dist.json')
  if (!(await fileExists(configPath))) {
    return
  }

  let config
  try {
    config = await readJsonFile(configPath)
  } catch (err) {
    throw new Error(`Error reading plugin config (${configPath}): ${err.message}`)
  }

  if (typeof config !== 'object' || Array.isArray(config) || !config) {
    throw new Error(
      `Error reading plugin config (${configPath}): must be an object, got:\n${JSON.stringify(
        config,
        null,
        2
      )}`
    )
  }
}

function warnOnUselessFiles(files) {
  const warnFor = files
    .filter(
      (file) =>
        uselessFiles.includes(file) ||
        uselessFiles.some((useless) => file.startsWith(`${useless}/`))
    )
    .map((file) => `"${file}"`)
    .join(', ')

  if (warnFor.length === 0) {
    return false
  }

  log.warn(
    `This plugin is set to publish the following files, which are generally not needed in a published npm module: ${warnFor}.`
  )
  log.warn(
    `Consider adding these files to an .npmignore or the package.json "files" property. See https://docs.npmjs.com/using-npm/developers.html#keeping-files-out-of-your-package for more information.`
  )

  return true
}

async function verifyImports({pkg, manifest, basePath}) {
  // "Entry" as in... code may start here.
  const entries = []
    .concat(
      getReferencedPaths(pkg, basePath), // From npm
      getReferencesPartPaths(manifest, basePath) // From parts
    )
    // Remove duplicates
    .filter((file, index, arr) => arr.indexOf(file, index + 1) === -1)
    // Remove non-javascript entries
    .filter((file) => path.extname(file) === '.js')

  const dependencies = findDependencies(entries)
  const modules = dependencies.filter((dep) => !/^(all|part|config):/.test(dep))

  await verifyNoUndeclaredDependencies(modules, pkg)
  await verifyReactDependencies(modules, pkg)
  await verifyConfigParts(dependencies, pkg, basePath)
  await verifyNoUnusedDependencies(modules, pkg)
  await verifyNoUndeclaredParts(dependencies, pkg, manifest)
}

function verifyNoUndeclaredParts(dependencies, pkg, manifest) {
  const parts = dependencies
    .filter((dep) => dep.startsWith('all:') || dep.startsWith('part:'))
    .map((part) => part.replace(/^all:/, ''))
    .map((part) => part.replace(/\?$/, ''))
    .filter((part) => part.startsWith(`part:${pkg.name.replace(/^sanity-plugin-/, '')}`))

  const declaredParts = (manifest.parts || []).reduce(
    (partNames, part) => [...partNames, ...[part.name, part.implements].filter(Boolean)],
    []
  )
  const undeclaredParts = parts.filter((partName) => !declaredParts.includes(partName))

  if (undeclaredParts.length > 0) {
    const aPart = undeclaredParts.length > 1 ? 'parts' : 'a part'
    const is = undeclaredParts.length > 1 ? 'are' : 'is'
    const partList = undeclaredParts.map((part) => `"${part}"`).join(', ')
    throw new Error(
      `Invalid plugin: Source is using ${aPart} that ${is} not declared in "sanity.json":\n\n${partList}.`
    )
  }
}

function verifyNoUnusedDependencies(modules, pkg) {
  const potentiallyUnused = Object.keys(pkg.dependencies || {}).filter(
    (dep) => !modules.includes(dep)
  )

  if (potentiallyUnused.length > 0) {
    const unusedNames = potentiallyUnused.map((dep) => `"${dep}"`).join(', ')
    log.warn(`Found modules listed as dependencies which seem to be unused by code: ${unusedNames}`)
  }
}

function verifyReactDependencies(modules, pkg) {
  if (modules.includes('react') && 'react' in (pkg.dependencies || {})) {
    throw new Error(
      `Invalid plugin: "react" declared as a dependency - it should be declared as a peerDependency (package.json)`
    )
  }

  if (modules.includes('react-dom') && 'react-dom' in (pkg.dependencies || {})) {
    throw new Error(
      `Invalid plugin: "react-dom" declared as a dependency - it should be declared as a peerDependency (package.json)`
    )
  }

  if (modules.includes('prop-types') && 'prop-types' in (pkg.peerDependencies || {})) {
    throw new Error(
      `Invalid plugin: "prop-types" declares as peerDependency - it should be declared as a dependency (package.json)`
    )
  }
}

async function verifyConfigParts(dependencies, pkg, basePath) {
  const configName = `config:${pkg.name.replace(/^sanity-plugin-/, '')}`
  if (
    dependencies.includes(configName) &&
    !(await fileExists(path.join(basePath, 'config.dist.json')))
  ) {
    throw new Error(
      `Plugin imports plugin config (${configName}) but does not contain a "config.dist.json" file.`
    )
  }

  const nonPluginConfigs = dependencies.filter(
    (dep) => dep.startsWith('config:') && dep !== configName
  )

  if (nonPluginConfigs.length > 0) {
    const configs = nonPluginConfigs.length > 1 ? 'configs' : 'config'
    const nonPluginConfigNames = nonPluginConfigs.join(', ')
    log.warn(
      `Found references to external ${configs}: ${nonPluginConfigNames} - this is generally considered unsafe`
    )
  }
}

function verifyNoUndeclaredDependencies(modules, pkg) {
  const undeclared = getUndeclaredDependencies(modules, pkg)
  if (undeclared.length > 0) {
    throw new Error(getUndeclaredDependenciesError(undeclared))
  }
}

function getUndeclaredDependencies(modules, pkg) {
  const deps = [].concat(
    Object.keys(pkg.dependencies || {}),
    Object.keys(pkg.peerDependencies || {})
  )

  const devDeps = Object.keys(pkg.devDependencies || {})

  return modules
    .filter((modDep) => !deps.includes(modDep))
    .map((modDep) => ({
      dependency: modDep,
      isDevDep: devDeps.includes(modDep),
    }))
}

function getUndeclaredDependenciesError(undeclared) {
  const baseError = `Invalid plugin`
  const moduleNames = undeclared.map((mod) => mod.dependency)

  let declaredWhere = `should be declared in package.json under "dependencies" or "peerDependencies".`
  if (moduleNames.length === 1 && moduleNames[0] === 'react') {
    declaredWhere = `should be declared in package.json under "peerDependencies"`
  } else if (moduleNames.includes('react')) {
    declaredWhere = `should either be declared in package.json under "dependencies" or "peerDependencies" (react should be in "peerDependencies").`
  }

  const devDeps = undeclared.filter((dep) => dep.isDevDep).map((dep) => `  - ${dep.dependency}\n`)
  if (devDeps.length > 0) {
    const modules = devDeps.length > 1 ? 'modules' : 'module'
    const depList = devDeps.join('')
    const target = devDeps.length > 1 ? 'They' : 'It'
    const are = devDeps.length > 1 ? 'are' : 'is'
    return `${baseError}: Source uses ${modules} that ${are} declared in "devDependencies":\n\n${depList}\n${target} ${declaredWhere}`
  }

  const modules = undeclared.length > 1 ? 'modules' : 'module'
  const depList = undeclared.map((dep) => `  - ${dep.dependency}\n`).join('')
  const target = undeclared.length > 1 ? 'They' : 'It'
  const are = undeclared.length > 1 ? 'are' : 'is'
  return `${baseError}: Source uses ${modules} that ${are} not declared as dependencies:\n\n${depList}\n${target} ${declaredWhere}`
}
