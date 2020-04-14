const path = require('path')
const {readManifest, getReferencesPartPaths} = require('../sanity/manifest')
const {getPackage, getReferencedPaths} = require('../npm/package')
const {getPublishableFiles} = require('../npm/publish')
const {fileExists} = require('../util/files')

module.exports = async function verify({basePath, flags}) {
  const pkg = await getPackage({basePath, flags})
  const manifest = await readManifest({
    basePath,
    pluginName: pkg.name,
    flags,
    verifyCompiledParts: true,
    verifySourceParts: true,
  })

  verifyPublishableFiles({basePath, pkg, manifest})
  verifyLicenseKey(pkg)
}

async function verifyPublishableFiles({pkg, manifest, basePath}) {
  const explicitlyRequired = ['README.md', 'LICENSE']

  // Validate that these files exists, not just that they are publishable
  ;(
    await Promise.all(explicitlyRequired.map((file) => fileExists(path.resolve(basePath, file))))
  ).forEach((exists, i) => {
    if (!exists) {
      throw new Error(
        `This plugin does not contain the file "${explicitlyRequired[i]}", which is a required file for Sanity plugins.`
      )
    }
  })

  // Always, uhm... "kindly suggest", to include these files
  const files = explicitlyRequired
    // Get files from parts as well as the ones references in package.json
    .concat(getReferencesPartPaths(manifest), getReferencedPaths(pkg))
    // Make all paths relative to base path
    .map((file) => path.relative(basePath, file))
    // Remove duplicates
    .filter((file, index, arr) => arr.indexOf(file, index + 1) === -1)

  // Get all files intended to be published from npm
  const publishable = await getPublishableFiles(basePath)

  // Verify that all explicitly referenced files are publishable
  const unpublishable = files.filter((file) => !publishable.includes(file))

  // Warn with "default error" for unknowns
  const unknowns = unpublishable
    .filter((item) => !explicitlyRequired.includes(item))
    .map((file) => `"${file}"`)

  if (unknowns.length > 0) {
    const paths = unknowns.join(', ')
    throw new Error(
      `This plugin references files that are ignored from being published: ${paths}. Check .gitignore, .npmignore and/or the "files" property of package.json. See https://docs.npmjs.com/using-npm/developers.html#keeping-files-out-of-your-package for more information.`
    )
  }

  // Warn with known messages for "knowns"
  const knowns = unpublishable
    .filter((item) => explicitlyRequired.includes(item))
    .map((file) => `"${file}"`)

  knowns.forEach((file) => {
    throw new Error(
      `This plugin is set to not publish "${file}". For Sanity plugins, this file is a requirement.`
    )
  })
}

function verifyLicenseKey(pkg) {
  if (!pkg.license) {
    throw new Error(
      `package.json is missing "license" key: see https://docs.npmjs.com/files/package.json#license and make sure it matches your "LICENSE" file.`
    )
  }
}
