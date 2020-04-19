const pProps = require('p-props')
const getLatestVersion = require('get-latest-version')

module.exports = {resolveLatestVersions}

function resolveLatestVersions(packages) {
  const versions = {}
  for (const pkgName of packages) {
    versions[pkgName] = 'latest'
  }

  return pProps(versions, (range, pkgName) => getLatestVersion(pkgName, {range}), {
    concurrency: 8,
  })
}
