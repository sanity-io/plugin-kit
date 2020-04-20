const path = require('path')
const licenses = require('@rexxars/choosealicense-list')
const gitRemoteOriginUrl = require('git-remote-origin-url')
const log = require('../util/log')
const {getUserInfo} = require('../util/user')
const {nullifyError} = require('../util/nullifyError')
const {readManifest} = require('../sanity/manifest')
const {getPackage, writePackageJson, addBuildScripts} = require('../npm/package')
const {prompt, promptForPackageName, promptForRepoOrigin} = require('../util/prompt')
const {generateReadme, isDefaultGitHubReadme, replaceInReadme} = require('../util/readme')

const {
  readFile,
  readJsonFile,
  fileExists,
  writeFile,
  writeJsonFile,
  copyFileWithOverwritePrompt,
  writeFileWithOverwritePrompt,
} = require('../util/files')

const bannedFields = ['login', 'description', 'projecturl', 'email']
const preferredLicenses = ['MIT', 'ISC', 'BSD-3-Clause']
const otherLicenses = Object.keys(licenses.list).filter((id) => {
  const license = licenses.list[id]
  return (
    !preferredLicenses.includes(id) &&
    !bannedFields.some((field) => license.body.includes(`[${field}]`))
  )
})

module.exports = async function splat(options) {
  const {basePath, flags, requireUserConfirmation} = options
  const info = (write, ...args) => write && log.info(...args)

  // Gather data
  const pkg = await getPackage(options).catch(nullifyError)
  log.debug('Plugin has package.json: %s', pkg ? 'yes' : 'no')

  const user = await getUserInfo(options, pkg)
  log.debug('User information: %o', user)

  const pkgName = pkg && pkg.name
  const pluginName =
    requireUserConfirmation || !pkgName ? await promptForPackageName(options, pkgName) : pkgName

  log.debug('Plugin name: %s', pluginName)

  const license = await getLicense(flags, {user, pluginName, pkg, requireUserConfirmation})
  const licenseChanged = (pkg && pkg.license) !== (license && license.id)
  log.debug('License: %s', license ? license.id : '<none>')

  const description = await getProjectDescription(basePath, pkg, requireUserConfirmation)
  log.debug('Description: %s', description || '<none>')

  const repoUrl =
    (await gitRemoteOriginUrl(basePath).catch(nullifyError)) ||
    (pkg && pkg.repository && pkg.repository.url)

  const gitOrigin = requireUserConfirmation ? await promptForRepoOrigin(options, repoUrl) : repoUrl

  log.debug('Remote origin: %s', gitOrigin || '<none>')

  const distConfigPath = path.join(basePath, 'config.dist.json')
  let distConfig = await readJsonFile(distConfigPath).catch(nullifyError)
  if (!distConfig && requireUserConfirmation) {
    const shouldHaveConfig = await prompt('Create plugin config file?', {type: 'confirm'})
    if (shouldHaveConfig) {
      distConfig = {'add-config': 'here'}
      await writeJsonFile(distConfigPath, distConfig)
      info(true, 'Wrote dist config (config.dist.json)')
    }
  }
  log.debug('Plugin has config: %s', distConfig ? 'yes' : 'no')

  // Output
  const data = {user, pluginName, license, description, pkg, gitOrigin, distConfig}
  let didWrite

  // Write package.json, if returns the original (data.pkg) if it was unchanged,
  // otherwise it returns the new object
  const newPkg = await writePackageJson(data, options)
  info(newPkg !== pkg, 'Wrote package.json')
  data.pkg = newPkg

  didWrite = await writeLicense(data, options, licenseChanged)
  info(didWrite, 'Wrote license file (LICENSE)')

  didWrite = await writeReadme(data, options, {previousPkg: pkg})
  info(didWrite, 'Wrote readme file (README.md)')

  didWrite = await writeStaticAssets(options)
  info(didWrite.length > 0, 'Wrote static asset files: %s', didWrite.join(', '))

  didWrite = await addBuildScripts(newPkg, options)
  info(didWrite, 'Added build scripts to package.json')

  didWrite = await addCompileDirToGitIgnore(data, options)
  info(didWrite, 'Added compilation output directory to .gitignore')
}

async function writeReadme(data, options, {previousPkg}) {
  const {basePath} = options

  const readmePath = path.join(basePath, 'README.md')
  const readme = await readFile(readmePath, 'utf8').catch(nullifyError)
  if (
    await replaceInReadme(readme, {
      path: readmePath,
      previousPkg,
      nextPkg: data.pkg,
      nextUser: data.user,
    })
  ) {
    return true
  }

  if (readme && !isDefaultGitHubReadme(readme)) {
    return false
  }

  await writeFileWithOverwritePrompt(readmePath, generateReadme(data), {encoding: 'utf8'})
  return true
}

async function writeLicense({license}, options, licenseChanged) {
  const {basePath, flags} = options

  if (flags.license === false || !license) {
    return false
  }

  // Prefer whatever path the user is currenly using (LICENSE.md or LICENSE)
  const hasLicenseMdFile = await fileExists(path.join(basePath, 'LICENSE.md'))
  const licensePath = path.join(basePath, hasLicenseMdFile ? 'LICENSE.md' : 'LICENSE')

  await writeFileWithOverwritePrompt(licensePath, license.text, {
    encoding: 'utf8',
    default: licenseChanged,
  })

  return true
}

async function getLicense(flags, {user, pluginName, pkg, requireUserConfirmation} = {}) {
  const license = await getLicenseIdentifier(flags, pkg, requireUserConfirmation)
  if (!license) {
    return null
  }

  const text = license.body
    .replace(/\[fullname\]/g, user.name)
    .replace(/\[project\]/g, pluginName)
    .replace(/\[year\]/g, new Date().getFullYear())

  return {id: license.id, text}
}

async function getLicenseIdentifier(flags, pkg, requireUserConfirmation = false) {
  // --no-license
  if (flags.license === false) {
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

async function getProjectDescription(basePath, pkg, requireUserConfirmation = false) {
  let description = await resolveProjectDescription(basePath, pkg)
  if (!description || requireUserConfirmation) {
    description = await prompt('Plugin description', {default: description || ''})
  }
  return description
}

async function resolveProjectDescription(basePath, pkg) {
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
    return nullifyError(err)
  }
}

async function writeStaticAssets({basePath}) {
  const assetsDir = path.join(__dirname, '..', 'assets', 'splat')
  const from = (...segments) => path.join(assetsDir, ...segments)
  const to = (...segments) => path.join(basePath, ...segments)

  const fileNames = ['.editorconfig', '.gitignore']
  const writes = await Promise.all(
    fileNames.map((fileName) => copyFileWithOverwritePrompt(from(fileName), to(fileName)))
  )

  return fileNames.filter((_, i) => writes[i])
}

async function addCompileDirToGitIgnore(data, options) {
  const manifest = await readManifest({...options, validate: false})
  if (!manifest || !manifest.paths || !manifest.paths.compiled) {
    return false
  }

  const gitIgnorePath = path.join(options.basePath, '.gitignore')
  const gitignore = await readFile(gitIgnorePath, 'utf8').catch(nullifyError)
  if (!gitignore) {
    return false
  }

  const ignore = `/${manifest.paths.compiled.replace(/^[./]+/, '')}`
  const lines = gitignore.split('\n')
  if (lines.includes(ignore)) {
    return false
  }

  lines.push('# Compiled plugin', ignore, '\n')

  await writeFile(gitIgnorePath, lines.join('\n'), {encoding: 'utf8'})
  return true
}
