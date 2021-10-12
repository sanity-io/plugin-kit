const pProps = require('p-props')
const getLatestVersion = require('get-latest-version')

module.exports = {resolveLatestVersions}

function resolveLatestVersions(packages) {
  const versions = {}
  for (const pkgName of packages) {
    versions[pkgName] = 'latest'
  }

  return pProps(
    versions,
    async (range, pkgName) => {
      const version = await getLatestVersion(pkgName, {range})
      return rangeify(version)
    },
    {concurrency: 8}
  )
}

function rangeify(version) {
  return `^${version}`
}
