import {FromTo, InjectOptions, writeAssets} from '../actions/inject'
import {resolveLatestVersions} from '../npm/resolveLatestVersions'
import {Preset} from './presets'
import {
  addBuildScripts,
  addPackageJsonScripts,
  addScript,
  getPackage,
  sortKeys,
  writePackageJsonDirect,
} from '../npm/package'
import log from '../util/log'

export const semverWorkflowPreset: Preset = {
  name: 'semver-workflow',
  description:
    'Files and dependencies for conventional-commits, github workflow and semantic-release.',
  apply: applyPreset,
}

const info = (write: boolean, msg: string, ...args: string[]) => write && log.info(msg, ...args)

async function applyPreset(options: InjectOptions) {
  await writeAssets(semverWorkflowFiles(), options)
  await addPrepareScript(options)
  await addDevDependencies(options)
}

async function addPrepareScript(options: InjectOptions) {
  const pkg = await getPackage(options)
  const didWrite = await addPackageJsonScripts(pkg, options, (scripts) => {
    scripts.prepare = addScript(`husky install`, scripts.prepare)
    return scripts
  })
  info(didWrite, 'Added prepare script to package.json')
}

async function addDevDependencies(options: InjectOptions) {
  const pkg = await getPackage(options)
  const devDeps = sortKeys({
    ...pkg.devDependencies,
    ...(await semverWorkflowDependencies()),
  })
  const newPkg = {...pkg}
  newPkg.devDependencies = devDeps
  await writePackageJsonDirect(newPkg, options)
  log.info('Updated devDependencies.')
}

function semverWorkflowFiles(): FromTo[] {
  return [
    {from: ['.github', 'workflows', 'main.yml'], to: ['.github', 'workflows', 'main.yml']},
    {from: ['.husky', 'commit-msg'], to: ['.husky', 'commit-msg']},
    {from: ['.husky', 'pre-commit'], to: ['.husky', 'pre-commit']},
    {from: ['.releaserc.json'], to: '.releaserc.json'},
    {from: ['commitlint.config.js'], to: 'commitlint.config.js'},
  ].map((fromTo) => ({
    ...fromTo,
    from: ['semver-workflow', ...fromTo.from],
  }))
}

async function semverWorkflowDependencies(): Promise<Record<string, string>> {
  return resolveLatestVersions([
    '@commitlint/cli',
    '@commitlint/config-conventional',
    '@sanity/semantic-release-preset',
    'husky',
    'lint-staged',
  ])
}
