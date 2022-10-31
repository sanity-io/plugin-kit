import path from 'path'
import {inject} from './inject'
import {ensureDir, writeFile} from '../util/files'
import {resolveLatestVersions} from '../npm/resolveLatestVersions'
import sharedFlags from '../sharedFlags'
import {TypedFlags} from 'meow'
import {getPackage} from '../npm/package'
import {defaultSourceJs, defaultSourceTs} from '../configs/default-source'
import {incompatiblePluginPackage} from '../constants'
import {forcedPackageVersions} from '../configs/forced-package-versions'

export const initFlags = {
  ...sharedFlags,
  scripts: {
    type: 'boolean',
    default: true,
  },
  eslint: {
    type: 'boolean',
    default: true,
  },
  typescript: {
    type: 'boolean',
    default: true,
  },
  prettier: {
    type: 'boolean',
    default: true,
  },
  license: {
    type: 'string',
  },
  editorconfig: {
    type: 'boolean',
    default: true,
  },
  gitignore: {
    type: 'boolean',
    default: true,
  },
  force: {
    type: 'boolean',
    default: false,
  },
  install: {
    type: 'boolean',
    default: true,
  },
  name: {
    type: 'string',
  },
  author: {
    type: 'string',
  },
  repo: {
    type: 'string',
  },
  presetOnly: {
    type: 'boolean',
    default: false,
  },
  preset: {
    type: 'string',
    isMultiple: true,
  },
} as const

export type InitFlags = TypedFlags<typeof initFlags>

const defaultDependencies = [incompatiblePluginPackage]

const defaultDevDependencies = {
  react: forcedPackageVersions.react,
  sanity: forcedPackageVersions.sanity,
}
const defaultPeerDependencies = {
  react: forcedPackageVersions.react,
  sanity: forcedPackageVersions.sanity,
}

export interface InitOptions {
  basePath: string
  flags: InitFlags
}

export async function init(options: InitOptions) {
  let dependencies = {}
  let devDependencies = {}
  let peerDependencies = {}

  dependencies = {...dependencies, ...(await resolveLatestVersions(defaultDependencies))}
  devDependencies = {
    ...devDependencies,
    ...defaultDevDependencies,
    ...(await resolveLatestVersions(['rimraf'])),
  }
  peerDependencies = {
    ...peerDependencies,
    ...defaultPeerDependencies,
  }

  await inject({
    ...options,
    requireUserConfirmation: !options.flags.force,
    dependencies,
    devDependencies,
    peerDependencies,
    validate: false,
  })

  const packageJson = await getPackage({basePath: options.basePath, validate: false})
  const typescript = options.flags.typescript
  const source = typescript ? defaultSourceTs(packageJson) : defaultSourceJs(packageJson)
  const filename = typescript ? 'index.ts' : 'index.js'
  const srcDir = path.resolve(options.basePath, 'src')
  await ensureDir(srcDir)
  await writeFile(path.join(srcDir, filename), source, {encoding: 'utf8'})
}
