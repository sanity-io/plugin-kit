const path = require('path')
const {readManifest, getReferencesPartPaths} = require('../sanity/manifest')
const {getPackage, getReferencedPaths} = require('../npm/package')
const {getPublishableFiles} = require('../npm/publish')

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
  const explictlyRequired = ['README.md', 'LICENSE']

  // Always, uhm... "kindly suggest", to include these files
  const files = explictlyRequired
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
    .filter((item) => !explictlyRequired.includes(item))
    .map((file) => `"${file}"`)

  if (unknowns.length > 0) {
    const paths = unknowns.join(', ')
    throw new Error(
      `This plugin references files that are ignored from being published: ${paths}. Check .gitignore, .npmignore and/or the "files" property of package.json. See https://docs.npmjs.com/using-npm/developers.html#keeping-files-out-of-your-package for more information.`
    )
  }

  // Warn with known messages for "knowns"
  const knowns = unpublishable
    .filter((item) => explictlyRequired.includes(item))
    .map((file) => `"${file}"`)

  knowns.forEach((file) => {
    throw new Error(
      `This plugin is set to not publish "${file}". It's highly recommended that you include this file.`
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
