import {Preset} from './presets'
import {InjectOptions} from '../actions/inject'
import {forceDependencyVersions, getPackage, sortKeys, writePackageJsonDirect} from '../npm/package'
import log from '../util/log'
import chalk from 'chalk'
import {resolveLatestVersions} from '../npm/resolveLatestVersions'
import {forcedDevPackageVersions, forcedPackageVersions} from '../configs/forced-package-versions'

export const ui: Preset = {
  name: 'ui',
  description: '`@sanity/ui` and dependencies',
  apply: applyPreset,
}

async function applyPreset(options: InjectOptions) {
  await addDependencies(options)
  await addDevDependencies(options)

  log.info(chalk.green('ui preset injected'))
}

async function addDependencies(options: InjectOptions) {
  const pkg = await getPackage(options)
  const newDeps = sortKeys(
    forceDependencyVersions(
      {
        ...pkg.dependencies,
        ...(await resolveDependencyList()),
      },
      forcedPackageVersions
    )
  )
  const newPkg = {...pkg}
  newPkg.dependencies = newDeps
  await writePackageJsonDirect(newPkg, options)
  log.info('Updated dependencies.')
}

async function addDevDependencies(options: InjectOptions) {
  const pkg = await getPackage(options)
  const newDeps = sortKeys(
    forceDependencyVersions(
      {
        ...pkg.devDependencies,
        ...(await resolveDevDependencyList()),
      },
      forcedDevPackageVersions
    )
  )
  const newPkg = {...pkg}
  newPkg.devDependencies = newDeps
  await writePackageJsonDirect(newPkg, options)
  log.info('Updated devDependencies.')
}

async function resolveDependencyList(): Promise<Record<string, string>> {
  return resolveLatestVersions(['@sanity/icons', '@sanity/ui'])
}

async function resolveDevDependencyList(): Promise<Record<string, string>> {
  return resolveLatestVersions([
    // install the peer dependencies of `@sanity/ui` as dev dependencies
    'react',
    'react-dom',
    'react-is',
    'styled-components',
  ])
}
