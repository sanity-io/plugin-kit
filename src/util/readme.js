const outdent = require('outdent')
const licenses = require('@rexxars/choosealicense-list')

module.exports = {generateReadme, isDefaultGitHubReadme}

function generateReadme(data) {
  const {user, pluginName, license, description, distConfig} = data
  const shortName = pluginName.replace(/^sanity-plugin-/, '')

  let configurationText = ''
  if (distConfig) {
    configurationText = outdent`
      ## Configuration

      The plugin can be configured through \`<your-studio-folder>/config/${shortName}.json\`:

      \`\`\`json
      ${JSON.stringify(distConfig, null, 2)}
      \`\`\`
    `
  }

  let licenseText
  if (license) {
    const licenseName = license && licenses.find(license.id).title
    licenseText = '## License\n'
    if (licenseName && user.name) {
      licenseText = `${licenseText}\n${licenseName} © ${user.name}, see LICENSE`
    } else if (licenseName) {
      licenseText = `${licenseText}\n${licenseName}, see LICENSE`
    } else {
      licenseText = `${licenseText}\nSee LICENSE`
    }
  }

  return outdent`
    # ${pluginName}

    ${description}

    ## Installation
    \`\`\`
    sanity install ${shortName}
    \`\`\`

    ${configurationText}
    ${licenseText}
  `
}

function isDefaultGitHubReadme(readme) {
  if (!readme) {
    return false
  }

  const lines = readme.split('\n', 20).filter(Boolean)

  // title + _optional_ description
  return lines.length <= 2 && lines[0].startsWith('#')
}
