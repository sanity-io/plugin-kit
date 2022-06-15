import pProps from 'p-props'
// @ts-expect-error missing types
import getLatestVersion from 'get-latest-version'

// We may want to lock certain dependencies to specific versions
const lockedDependencies: Record<string, string> = {}

export function resolveLatestVersions(packages: string[]) {
  const versions: Record<string, string> = {}
  for (const pkgName of packages) {
    versions[pkgName] = pkgName in lockedDependencies ? lockedDependencies[pkgName] : 'latest'
  }

  return pProps(
    versions,
    async (range, pkgName) => {
      const version: string = await getLatestVersion(pkgName, {range})
      return rangeify(version)
    },
    {concurrency: 8}
  )
}

function rangeify(version: string) {
  return `^${version}`
}
