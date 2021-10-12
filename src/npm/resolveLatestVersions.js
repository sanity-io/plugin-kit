const pProps = require('p-props')
const getLatestVersion = require('get-latest-version')

// We may want to lock certain dependencies to specific versions
const lockedDependencies = {
  eslint: '^7.0.0', // Because eslint-plugin-react does not work with v8 yet
}

module.exports = {resolveLatestVersions}

function resolveLatestVersions(packages) {
  const versions = {}
  for (const pkgName of packages) {
    versions[pkgName] = pkgName in lockedDependencies ? lockedDependencies[pkgName] : 'latest'
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
