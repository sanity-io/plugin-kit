import {FromTo, InjectOptions, writeAssets} from '../actions/inject'
import {resolveLatestVersions} from '../npm/resolveLatestVersions'
import {Preset} from './presets'
import {
  addPackageJsonScripts,
  addScript,
  getPackage,
  sortKeys,
  writePackageJsonDirect,
} from '../npm/package'
import log from '../util/log'
import outdent from 'outdent'
import chalk from 'chalk'
import path from 'path'
import {readFile, writeFile} from '../util/files'
import {errorToUndefined} from '../util/errorToUndefined'
import {PackageJson} from '../actions/verify/types'
import {
  developTestSnippet,
  getLicenseText,
  installationSnippet,
  v3BannerNotice,
} from '../util/readme'
import {getUserInfo} from '../util/user'

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
  await updateReadme(options)
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

  log.info(
    chalk.green(
      outdent`
        semantic-release preset injected.

        Please confer
        https://github.com/sanity-io/plugin-kit/blob/main/docs/semver-workflow.md
        to finalize configuration for this preset.
  `.trim()
    )
  )
}

async function updateReadme(options: InjectOptions) {
  const {basePath} = options

  const readmePath = path.join(basePath, 'README.md')
  const readme = (await readFile(readmePath, 'utf8').catch(errorToUndefined)) ?? ''

  const {v3Banner, install, usage, developTest, license, releaseSnippet} = await readmeSnippets(
    options
  )

  const prependSections = missingSections(readme, [v3Banner, install, usage])
  const appendSections = missingSections(readme, [license, developTest, releaseSnippet])

  if (prependSections.length || appendSections.length) {
    const updatedReadme = [...prependSections, readme, ...appendSections]
      .filter(Boolean)
      .join('\n\n')
    await writeFile(readmePath, updatedReadme, {encoding: 'utf8'})
    log.info('Updated README. Please review the changes.')
  }
}

async function readmeSnippets(options: InjectOptions) {
  const pkg = await getPackage(options)
  const user = await getUserInfo(options, pkg)

  const bestEffortUrl = readmeBaseurl(pkg)

  const install = installationSnippet(pkg.name ?? 'unknown')

  const usage = outdent`
    ## Usage
  `

  const license = getLicenseText(typeof pkg.license === 'string' ? pkg.license : undefined, user)

  const releaseSnippet = outdent`
    ### Release new version

    Run ["CI & Release" workflow](${bestEffortUrl}/actions/workflows/main.yml).
    Make sure to select the main branch and check "Release new version".

    Semantic release will only release on configured branches, so it is safe to run release on any branch.
  `

  return {
    v3Banner: v3BannerNotice(),
    install,
    usage,
    license,
    developTest: developTestSnippet(),
    releaseSnippet,
  }
}

/**
 * Returns sections that does not exists "close enough" in readme
 */
export function missingSections(readme: string, sections: string[]) {
  return sections.filter((section) => !closeEnough(section, readme))
}

/**
 * a and b are considered "close enough" if > 50% of a lines exist in b lines
 * @param a
 * @param b
 */
function closeEnough(a: string, b: string) {
  const aLines = a.split('\n')
  const bLines = b.split('\n')

  const matchingLines = aLines.filter((line) => bLines.find((bLine) => bLine === line)).length
  const isCloseEnough = matchingLines >= aLines.length * 0.5
  return isCloseEnough
}

function semverWorkflowFiles(): FromTo[] {
  return [
    {from: ['.github', 'workflows', 'main.yml'], to: ['.github', 'workflows', 'main.yml']},
    {from: ['.husky', 'commit-msg'], to: ['.husky', 'commit-msg']},
    {from: ['.husky', 'pre-commit'], to: ['.husky', 'pre-commit']},
    {from: ['.releaserc.json'], to: '.releaserc.json'},
    {from: ['npmrc'], to: '.npmrc'},
    {from: ['commitlint.template.js'], to: 'commitlint.config.js'},
    {from: ['lint-staged.template.js'], to: 'lint-staged.config.js'},
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

export function readmeBaseurl(pkg: PackageJson) {
  return ((pkg.repository?.url ?? pkg.homepage ?? 'TODO') as string)
    .replace(/.+:\/\//g, 'https://')
    .replace(/\.git/g, '')
    .replace(/git@github.com\//g, 'github.com/')
    .replace(/git@github.com:/g, 'https://github.com/')
    .replace(/#.+/g, '')
}
