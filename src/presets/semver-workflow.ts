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
        https://github.com/sanity-io/plugin-kit/blob/main/docs/presets.md#semver-workflow
        to finalize configuration for this preset.
  `.trim()
    )
  )
}

async function updateReadme(options: InjectOptions) {
  const {basePath} = options

  const readmePath = path.join(basePath, 'README.md')
  let readme = (await readFile(readmePath, 'utf8').catch(errorToUndefined)) ?? ''

  if (readme) {
    const {v3Banner, installUsage, developFooter} = await readmeSnippets(options)
    readme = v3Banner + installUsage + readme + developFooter
    await writeFile(readmePath, readme, {encoding: 'utf8'})
    log.info('Updated README. Please review the changes.')
  }
}

async function readmeSnippets(options: InjectOptions) {
  const pkg = await getPackage(options)

  const v3Banner = outdent`
    > **NOTE**
    >
    > This is the **Sanity Studio v3 version** of ${pkg.name}.
    >
    > For the v2 version, please refer to the [v2-branch](${pkg.repository?.url ?? 'TODO'}).
  `

  const installUsage = outdent`

    ## Installation

    \`\`\`
    npm install --save ${pkg.name}@studio-v3
    \`\`\`

    or

    \`\`\`
    yarn add ${pkg.name}@studio-v3
    \`\`\`

    ## Usage

    <TODO: Show usage here>
  `

  const developFooter = outdent`

    ## License

    MIT-licensed. See LICENSE.

    ## Develop & test

    This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
    with default configuration for build & watch scripts.

    See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
    on how to run this plugin with hotreload in the studio.

    ### Release new version

    Run ["CI & Release" workflow](${pkg.repository?.url ?? 'TODO'}/actions/workflows/main.yml).
    Make sure to select the main branch and check "Release new version".

    Semantic release will only release on configured branches, so it is safe to run release on any branch.
  `

  return {
    v3Banner,
    installUsage,
    developFooter,
  }
}

function semverWorkflowFiles(): FromTo[] {
  return [
    {from: ['.github', 'workflows', 'main.yml'], to: ['.github', 'workflows', 'main.yml']},
    {from: ['.husky', 'commit-msg'], to: ['.husky', 'commit-msg']},
    {from: ['.husky', 'pre-commit'], to: ['.husky', 'pre-commit']},
    {from: ['.releaserc.json'], to: '.releaserc.json'},
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
