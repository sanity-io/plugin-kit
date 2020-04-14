const {readManifest} = require('../sanity/manifest')
const {getPackage} = require('../npm/package')

module.exports = async function verify({basePath, flags}) {
  const pkg = await getPackage({basePath, flags})
  const manifest = await readManifest({
    basePath,
    pluginName: pkg.name,
    flags,
    verifyCompiledParts: true,
    verifySourceParts: true,
  })

  console.log(pkg, manifest)
}
