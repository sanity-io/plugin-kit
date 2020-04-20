const outdent = require('outdent')
const licenses = require('@rexxars/choosealicense-list')
const {writeFile} = require('./files')
const {getPackageUserInfo} = require('./user')

module.exports = {generateReadme, isDefaultGitHubReadme, replaceInReadme}

function generateReadme(data) {
  const {user, pluginName, license, description, distConfig} = data
  const shortName = getShortName(pluginName)

  let configurationText = ''
  if (distConfig) {
    configurationText = outdent`
      ## Configuration

      The plugin can be configured through \`${getStubConfigPath(pluginName)}\`:

      \`\`\`json
      ${JSON.stringify(distConfig, null, 2)}
      \`\`\`

    `
  }

  const descriptionText = description ? `\n${description}\n` : ''

  return outdent`
    # ${pluginName}
    ${descriptionText}
    ## Installation

    \`\`\`
    sanity install ${shortName}
    \`\`\`

    ${configurationText}
    ${getLicenseText(license && license.id, user)}
  `
}

function getLicenseText(licenseId, user) {
  if (!licenseId) {
    return ''
  }

  let licenseName = licenses.find(licenseId).title
  licenseName = licenseName && licenseName.replace(/\s+license$/i, '')

  let licenseText = '## License\n'
  if (licenseName && user.name) {
    licenseText = `${licenseText}\n${licenseName} © ${user.name}\nSee LICENSE`
  } else if (licenseName) {
    licenseText = `${licenseText}\n${licenseName}\nSee LICENSE`
  } else {
    licenseText = `${licenseText}\nSee LICENSE`
  }

  return licenseText
}

function getShortName(pluginName) {
  return pluginName.replace(/^sanity-plugin-/, '')
}

function getStubConfigPath(pluginName) {
  return `<your-studio-folder>/config/${getShortName(pluginName)}.json`
}

async function replaceInReadme(prevReadme, {path, previousPkg, nextPkg, nextUser}) {
  if (!prevReadme) {
    return false
  }

  const previousUser = getPackageUserInfo(previousPkg)

  let newReadme = prevReadme
    .replace(previousPkg.name, nextPkg.name)
    .replace(getStubConfigPath(previousPkg.name), getStubConfigPath(nextPkg.name))
    .replace(
      `sanity install ${getShortName(previousPkg.name)}`,
      `sanity install ${getShortName(nextPkg.name)}`
    )
    .replace(
      getLicenseText(previousPkg.license, previousUser),
      getLicenseText(nextPkg.license, nextUser)
    )

  if (previousPkg.description) {
    newReadme = newReadme.replace(previousPkg.description, nextPkg.description)
  }

  await writeFile(path, newReadme, 'utf8')
  return true
}

function isDefaultGitHubReadme(readme) {
  if (!readme) {
    return false
  }

  const lines = readme.split('\n', 20).filter(Boolean)

  // title + _optional_ description
  return lines.length <= 2 && lines[0].startsWith('#')
}
