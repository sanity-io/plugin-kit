const path = require('path')
const licenses = require('@rexxars/choosealicense-list')
const gitRemoteOriginUrl = require('git-remote-origin-url')
const log = require('../util/log')
const {getUserInfo} = require('../util/user')
const {nullifyError} = require('../util/nullifyError')
const {generateReadme, isDefaultGitHubReadme} = require('../util/readme')
const {getPackage, writePackageJson, addBuildScripts} = require('../npm/package')
const {prompt, promptForPackageName} = require('../util/prompt')
const {
  readFile,
  readJsonFile,
  fileExists,
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
  const {basePath, flags} = options
  const info = (write, ...args) => write && log.info(...args)

  // Gather data
  let pkg = await getPackage({basePath, flags}).catch(nullifyError)
  log.debug('Plugin has package.json: %s', pkg ? 'yes' : 'no')

  const user = await getUserInfo()
  log.debug('User information: %o', user)

  const pluginName = (pkg && pkg.name) || (await promptForPackageName({basePath}))
  log.debug('Plugin name: %s', pluginName)

  const license = await getLicense(flags, {user, pluginName, pkg})
  log.debug('License: %s', license ? license.id : '<none>')

  const description = await getProjectDescription(basePath, pkg)
  log.debug('Description: %s', description || '<none>')

  const gitOrigin =
    (await gitRemoteOriginUrl(basePath).catch(nullifyError)) ||
    (pkg.repository && pkg.repository.url)

  log.debug('Remote origin: %s', gitOrigin || '<none>')

  const distConfig = await readJsonFile(path.join(basePath, 'config.dist.json')).catch(nullifyError)
  log.debug('Plugin has config: %s', distConfig ? 'yes' : 'no')

  // Output
  const data = {user, pluginName, license, description, pkg, gitOrigin, distConfig}
  let didWrite
  pkg = await writePackageJson(data, options)
  info(pkg !== data.pkg, 'Updated package.json')

  didWrite = await writeLicense(license, options)
  info(didWrite, 'Wrote license file (LICENSE)')

  didWrite = await writeReadme(data, options)
  info(didWrite, 'Wrote readme file (README.md)')

  didWrite = await writeStaticAssets(options)
  info(didWrite.length > 0, 'Wrote static asset files: %s', didWrite.join(', '))

  didWrite = await addBuildScripts(pkg, options)
  info(didWrite, 'Added build scripts to package.json')
}

async function writeReadme(data, options) {
  const {basePath} = options

  const readmePath = path.join(basePath, 'README.md')
  const readme = await readFile(readmePath, 'utf8').catch(nullifyError)
  if (readme && !isDefaultGitHubReadme(readme)) {
    return
  }

  await writeFileWithOverwritePrompt(readmePath, generateReadme(data), {encoding: 'utf8'})
}

async function writeLicense(license, options) {
  const {basePath, flags} = options

  if (flags.license === false || !license) {
    return
  }

  // Prefer whatever path the user is currenly using (LICENSE.md or LICENSE)
  const hasLicenseMdFile = await fileExists(path.join(basePath, 'LICENSE.md'))
  const licensePath = path.join(basePath, hasLicenseMdFile ? 'LICENSE.md' : 'LICENSE')

  await writeFileWithOverwritePrompt(licensePath, license.text, {
    encoding: 'utf8',
  })
}

async function getLicense(flags, {user, pluginName, pkg} = {}) {
  const license = await getLicenseIdentifier(flags, pkg)
  if (!license) {
    return null
  }

  const text = license.body
    .replace(/\[fullname\]/g, user.name)
    .replace(/\[project\]/g, pluginName)
    .replace(/\[year\]/g, new Date().getFullYear())

  return {id: license.id, text}
}

async function getLicenseIdentifier(flags, pkg) {
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
  if (pkg.license) {
    const license = licenses.find(`${pkg.license}`)
    if (license) {
      return license
    }

    // Warn, then prompt the user
    log.warn(`package.json contains license "${pkg.license}", which is not recognized`)
  }

  const licenseId = await prompt('Which license do you want to use?', {
    choices: [
      prompt.separator(),
      ...preferredLicenses.map((value) => ({value, name: licenses.list[value].title})),
      prompt.separator(),
      ...otherLicenses.map((value) => ({value, name: licenses.list[value].title})),
    ],
  })

  return licenses.find(licenseId)
}

async function getProjectDescription(basePath, pkg) {
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
