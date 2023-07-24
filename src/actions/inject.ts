import path from 'path'
// @ts-expect-error missing types
import licenses from '@rexxars/choosealicense-list'
import gitRemoteOriginUrl from 'git-remote-origin-url'
import log from '../util/log'
import {getUserInfo} from '../util/user'
import {errorToUndefined} from '../util/errorToUndefined'
import {addBuildScripts, getPackage, writePackageJson} from '../npm/package'
import {prompt, promptForPackageName, promptForRepoOrigin} from '../util/prompt'
import {generateReadme, isDefaultGitHubReadme} from '../util/readme'

import {
  copyFileWithOverwritePrompt,
  fileExists,
  readFile,
  writeFile,
  writeFileWithOverwritePrompt,
} from '../util/files'
import {InitFlags} from './init'
import {PackageJson} from './verify/types'
import {injectPresets} from '../presets/presets'
import {tsconfigTemplateDist, tsconfigTemplate, tsconfigTemplateSettings} from '../configs/tsconfig'
import {pkgConfigTemplate} from '../configs/pkg-config'
import {gitignoreTemplate} from '../configs/git'
import {eslintignoreTemplate, eslintrcTemplate} from '../configs/eslint'
import {prettierignoreTemplate} from '../configs/prettier'

const bannedFields = ['login', 'description', 'projecturl', 'email']
const preferredLicenses = ['MIT', 'ISC', 'BSD-3-Clause']
const otherLicenses = Object.keys(licenses.list).filter((id) => {
  const license = licenses.list[id]
  return (
    !preferredLicenses.includes(id) &&
    !bannedFields.some((field) => license.body.includes(`[${field}]`))
  )
})

export interface InjectCopyFromTo {
  type: 'copy'
  from: string | string[]
  to: string | string[]
}

export interface InjectTemplate {
  type: 'template'
  to: string | string[]
  value: string
  force?: boolean
}

export type Injectable = InjectCopyFromTo | InjectTemplate

export interface InjectOptions {
  basePath: string
  requireUserConfirmation?: boolean
  flags: InitFlags
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  validate?: boolean
  outDir: string
}

export interface PackageData {
  user?: {name?: string; email?: string}
  pluginName?: string
  license?: {id: string; text: string}
  description?: string
  pkg?: PackageJson
  gitOrigin?: string
}

export async function inject(options: InjectOptions) {
  if (options.flags.presetOnly) {
    log.info('Only apply presets, skipping default inject.')
  } else {
    await injectBase(options)
  }
  await injectPresets(options)
}

async function injectBase(options: InjectOptions) {
  const {basePath, flags, requireUserConfirmation} = options
  const info = (write: boolean, msg: string, ...args: string[]) => write && log.info(msg, ...args)
  // Gather data
  const pkg = await getPackage(options).catch(errorToUndefined)
  log.debug('Plugin has package.json: %s', pkg ? 'yes' : 'no')

  const user = await getUserInfo(options, pkg)
  log.debug('User information: %o', user)

  const pkgName = flags.name ?? pkg?.name
  const pluginName =
    requireUserConfirmation || !pkgName ? await promptForPackageName(options, pkgName) : pkgName

  log.debug('Plugin name: %s', pluginName)

  const license = await getLicense(flags, {user, pluginName, pkg, requireUserConfirmation})
  const licenseChanged = (pkg && pkg.license) !== (license && license.id)
  log.debug('License: %s', license ? license.id : '<none>')

  const description = await getProjectDescription(basePath, pkg, requireUserConfirmation)
  log.debug('Description: %s', description || '<none>')

  const repoUrl =
    flags.repo ??
    ((await gitRemoteOriginUrl(basePath).catch(errorToUndefined)) || pkg?.repository?.url)

  const gitOrigin = requireUserConfirmation ? await promptForRepoOrigin(options, repoUrl) : repoUrl

  log.debug('Remote origin: %s', gitOrigin || '<none>')

  // Output
  const data: PackageData = {user, pluginName, license, description, pkg, gitOrigin}
  let didWrite

  // Write package.json, if returns the original (data.pkg) if it was unchanged,
  // otherwise it returns the new object
  const newPkg = await writePackageJson(data, options)
  info(newPkg !== pkg, 'Wrote package.json')
  data.pkg = newPkg

  didWrite = await writeLicense(data, options, licenseChanged)
  info(didWrite, 'Wrote license file (LICENSE)')

  didWrite = await writeReadme(data, options)
  info(didWrite, 'Wrote readme file (README.md)')

  didWrite = await writeStaticAssets(options)
  info(didWrite.length > 0, 'Wrote static asset files: %s', didWrite.join(', '))

  didWrite = await addBuildScripts(newPkg, options)
  info(didWrite, 'Added build scripts to package.json')

  didWrite = await addCompileDirToGitIgnore(data, options)
  info(didWrite, 'Added compilation output directory to .gitignore')
}

async function writeReadme(data: PackageData, options: InjectOptions) {
  const {basePath} = options

  const readmePath = path.join(basePath, 'README.md')
  const readme = await readFile(readmePath, 'utf8').catch(errorToUndefined)

  if (readme && !isDefaultGitHubReadme(readme)) {
    return false
  }

  await writeFileWithOverwritePrompt(readmePath, generateReadme(data), {
    encoding: 'utf8',
    force: options.flags.force,
  })
  return true
}

async function writeLicense(
  {license}: PackageData,
  options: InjectOptions,
  licenseChanged: boolean,
) {
  const {basePath, flags} = options

  if ((flags.license as unknown as boolean) === false || !license) {
    return false
  }

  // Prefer whatever path the user is currenly using (LICENSE.md or LICENSE)
  const hasLicenseMdFile = await fileExists(path.join(basePath, 'LICENSE.md'))
  const licensePath = path.join(basePath, hasLicenseMdFile ? 'LICENSE.md' : 'LICENSE')

  await writeFileWithOverwritePrompt(licensePath, license.text, {
    encoding: 'utf8',
    default: licenseChanged,
    force: flags.force,
  })

  return true
}

async function getLicense(
  flags: InitFlags,
  {
    user,
    pluginName,
    pkg,
    requireUserConfirmation,
  }: PackageData & {requireUserConfirmation?: boolean},
) {
  const license = await getLicenseIdentifier(flags, pkg, requireUserConfirmation)
  if (!license) {
    return undefined
  }

  const text = license.body
    .replace(/\[fullname\]/g, user?.name)
    .replace(/\[project\]/g, pluginName)
    .replace(/\[year\]/g, new Date().getFullYear())

  return {id: license.id, text}
}

async function getLicenseIdentifier(
  flags: InitFlags,
  pkg: PackageJson | undefined,
  requireUserConfirmation = false,
) {
  // --no-license
  if ((flags.license as unknown) === false) {
    return null
  }

  // --license becomes "", --license mit beocomes "mit"
  if (typeof flags.license === 'string') {
    const license = licenses.find(`${flags.license}`)
    if (!license) {
      throw new Error(`License "${flags.license}" not found`)
    }
    return license
  }

  // no --license flag provided, do we have one in package already?
  if (pkg && pkg.license && !requireUserConfirmation) {
    const license = licenses.find(`${pkg.license}`)
    if (license) {
      return license
    }

    // Warn, then prompt the user
    log.warn(`package.json contains license "${pkg.license}", which is not recognized`)
  }

  const licenseId = await prompt('Which license do you want to use?', {
    default: pkg && pkg.license && licenses.find(pkg.license) ? pkg.license : preferredLicenses[0],
    choices: [
      prompt.separator(),
      ...preferredLicenses.map((value) => ({value, name: licenses.list[value].title})),
      prompt.separator(),
      ...otherLicenses.map((value) => ({value, name: licenses.list[value].title})),
    ],
  })

  return licenses.find(licenseId)
}

async function getProjectDescription(
  basePath: string,
  pkg: PackageJson | undefined,
  requireUserConfirmation = false,
) {
  let description = await resolveProjectDescription(basePath, pkg)
  if (requireUserConfirmation) {
    description = await prompt('Plugin description', {default: description || ''})
  }
  return description ?? ''
}

async function resolveProjectDescription(basePath: string, pkg: PackageJson | undefined) {
  // Try to grab from package.json
  if (pkg && typeof pkg.description === 'string' && pkg.description.length > 5) {
    return pkg.description
  }

  // Try to grab a project description from a standard GitHub-generated readme
  try {
    const readmePath = path.join(basePath, 'README.md')
    const readme = await readFile(readmePath, 'utf8')
    const [title, description] = readme.split('\n').filter(Boolean)
    if (!title || !description || !title.match(/^#\s+\w+/)) {
      return null
    }

    // Naive, but this isn't too important
    const unlinked = description.replace(/\[(.*?)\]\(.*?\)/g, '$1')
    if (/^[^#]/.test(unlinked)) {
      return unlinked
    }

    return null
  } catch (err) {
    return errorToUndefined(err)
  }
}

export async function writeAssets(injectables: Injectable[], {basePath, flags}: InjectOptions) {
  const assetsDir = await findAssetsDir()

  const from = (...segments: string[]) => path.join(assetsDir, 'inject', ...segments)
  const to = (...segments: string[]) => path.join(basePath, ...segments)

  const writes: string[] = []
  for (const injectable of injectables) {
    if (injectable.type === 'copy') {
      const fromPath = asArray(injectable.from)
      const toPath = asArray(injectable.to)
      if (await copyFileWithOverwritePrompt(from(...fromPath), to(...toPath), flags)) {
        writes.push(path.join(...toPath))
      }
      continue
    }

    if (injectable.type === 'template') {
      const toPath = asArray(injectable.to)

      await writeFileWithOverwritePrompt(to(...toPath), `${injectable.value.trim()}\n`, {
        default: 'n',
        force: injectable.force || flags.force,
      })

      writes.push(path.join(...toPath))
      continue
    }

    throw new Error(`Unknown operation type "${(injectable as any).type}"`)
  }

  return writes
}

async function writeStaticAssets(options: InjectOptions) {
  const {outDir, flags} = options

  const files: Injectable[] = [
    flags.eslint && eslintrcTemplate({flags: options.flags}),
    flags.eslint && eslintignoreTemplate({outDir, flags: options.flags}),
    {type: 'copy', from: 'editorconfig', to: '.editorconfig'},
    {type: 'copy', from: 'sanity.json', to: 'sanity.json'},
    {type: 'copy', from: 'v2-incompatible.js.template', to: 'v2-incompatible.js'},
    pkgConfigTemplate({outDir, flags: options.flags}),
    flags.gitignore && gitignoreTemplate(),
    flags.typescript && tsconfigTemplate({flags: options.flags}),
    flags.typescript && tsconfigTemplateDist({outDir, flags: options.flags}),
    flags.typescript && tsconfigTemplateSettings({flags: options.flags}),
    flags.prettier && prettierignoreTemplate({outDir}),
    flags.prettier && {type: 'copy', from: 'prettierrc.json', to: '.prettierrc'},
  ]
    .map((f) => (f ? (f as Injectable) : undefined))
    .filter((f): f is Injectable => !!f)

  const result = writeAssets(files, options)

  return result
}

function asArray(input: string | string[]): string[] {
  return typeof input === 'string' ? [input] : input
}

/**
 * assets dir might be in higher or lower in the dir hierarchy depending on
 * if we run from `dist` or `src`
 */
async function findAssetsDir(): Promise<string> {
  let maxBackpaddle = 3
  let currDir = __dirname
  let assetsDir: string = ''
  while (!assetsDir && maxBackpaddle) {
    currDir = path.join(currDir, '..')
    const assets = path.join(currDir, 'assets')
    if (await fileExists(assets)) {
      assetsDir = assets
    } else {
      maxBackpaddle--
    }
  }

  if (!assetsDir) {
    throw new Error('Could not find assets directory!')
  }
  return assetsDir
}

async function addCompileDirToGitIgnore(data: PackageData, options: InjectOptions) {
  const gitIgnorePath = path.join(options.basePath, '.gitignore')
  const gitignore = await readFile(gitIgnorePath, 'utf8').catch(errorToUndefined)
  if (!gitignore) {
    return false
  }

  const output = data.pkg?.main ?? data.pkg?.module
  if (!output) {
    return false
  }

  const ignorePath = output.replace(/^[./]+/, '')
  const ignore = ignorePath.split('/')[0]
  if (!ignore) {
    return false
  }

  const lines = gitignore.trim().split('\n')
  if (lines.includes(ignore)) {
    return false
  }

  lines.push('', '# Compiled plugin', ignore)

  await writeFile(gitIgnorePath, lines.join('\n') + '\n', {encoding: 'utf8'})
  return true
}
