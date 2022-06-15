import outdent from 'outdent'
// @ts-expect-error missing types
import licenses from '@rexxars/choosealicense-list'
import {PackageData} from '../actions/splat'
import {User} from './user'

export function generateReadme(data: PackageData) {
  const {user, pluginName, license, description} = data

  return outdent`
    # ${pluginName}

    ## Installation

    \`\`\`
    npm install --save ${pluginName}
    \`\`\`

    or

    \`\`\`
    yarn add ${pluginName}
    \`\`\`

    ## Usage
    Add it as a plugin in sanity.config.ts (or .js):

    \`\`\`
     import {createConfig} from 'sanity'
     import {myPlugin} from '${pluginName}'

     export const createConfig({
         /...
         plugins: [
             myPlugin({})
         ]
     })
    \`\`\`
    ${getLicenseText(license?.id, user?.name ? (user as User) : undefined)}
  `
}

export function getLicenseText(licenseId?: string, user?: User) {
  if (!licenseId) {
    return ''
  }

  let licenseName: string | undefined = licenses.find(licenseId).title
  licenseName = licenseName?.replace(/\s+license$/i, '')

  let licenseText = '## License\n'
  if (licenseName && user?.name) {
    licenseText = `${licenseText}\n${licenseName} © ${user?.name}\nSee LICENSE`
  } else if (licenseName) {
    licenseText = `${licenseText}\n${licenseName}\nSee LICENSE`
  } else {
    licenseText = `${licenseText}\nSee LICENSE`
  }

  return licenseText
}

export function isDefaultGitHubReadme(readme: string) {
  if (!readme) {
    return false
  }

  const lines = readme.split('\n', 20).filter(Boolean)

  // title + _optional_ description
  return lines.length <= 2 && lines[0].startsWith('#')
}
