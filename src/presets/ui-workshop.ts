import {Preset} from './presets'
import {FromTo, InjectOptions, writeAssets} from '../actions/inject'
import {getPackage, sortKeys, writePackageJsonDirect} from '../npm/package'
import log from '../util/log'
import chalk from 'chalk'
import outdent from 'outdent'
import {resolveLatestVersions} from '../npm/resolveLatestVersions'
import path from 'path'
import {readFile, writeFile} from '../util/files'
import {errorToUndefined} from '../util/errorToUndefined'

export const uiWorkshop: Preset = {
  name: 'ui-workshop',
  description: 'Files for testing custom components with @sanity/ui-workshop',
  apply: applyPreset,
}

async function applyPreset(options: InjectOptions) {
  await writeAssets(files(), options)
  await addDevDependencies(options)
  await updateGitIgnore(options)
  log.info(
    chalk.green(
      outdent`
        ui-workshop preset injected.

        Please confer
        https://github.com/sanity-io/plugin-kit/blob/main/docs/ui-workshop.md#manual-steps-after-inject
        to finalize configuration for this preset.
  `.trim()
    )
  )
}

function files(): FromTo[] {
  return [
    {from: ['workshop.config.ts'], to: ['workshop.config.ts']},
    {from: ['src', 'CustomField.tsx'], to: ['src', 'CustomField.tsx']},
    {from: ['src', '__workshop__', 'index.tsx'], to: ['src', '__workshop__', 'index.tsx']},
    {from: ['src', '__workshop__', 'props.tsx'], to: ['src', '__workshop__', 'props.tsx']},
  ].map((fromTo) => ({
    ...fromTo,
    from: ['ui-workshop', ...fromTo.from],
  }))
}

async function updateGitIgnore(options: InjectOptions) {
  const {basePath} = options
  const gitignorePath = path.join(basePath, '.gitignore')
  let gitignore = (await readFile(gitignorePath, 'utf8').catch(errorToUndefined)) ?? ''
  const value = '.workshop'
  if (gitignore.includes(value)) {
    return
  }

  gitignore += `\n\n${value}`
  await writeFile(gitignorePath, gitignore, {encoding: 'utf8'})
}

async function addDevDependencies(options: InjectOptions) {
  const pkg = await getPackage(options)
  const devDeps = sortKeys({
    ...pkg.devDependencies,
    ...(await devDependencies()),
  })
  const newPkg = {...pkg}
  newPkg.devDependencies = devDeps
  await writePackageJsonDirect(newPkg, options)
  log.info('Updated devDependencies.')
}

async function devDependencies(): Promise<Record<string, string>> {
  return resolveLatestVersions([
    '@sanity/ui-workshop',
    '@sanity/icons',
    '@sanity/ui',
    'react',
    'react-dom',
    'styled-component',
  ])
}
