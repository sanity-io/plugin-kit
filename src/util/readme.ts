import outdent from 'outdent'
// @ts-expect-error missing types
import licenses from '@rexxars/choosealicense-list'
import {PackageData} from '../actions/inject'
import {User} from './user'

export function generateReadme(data: PackageData) {
  const {user, pluginName, license, description} = data

  return outdent`
    # ${pluginName}

    ${installationSnippet(pluginName ?? 'unknown')}

    ## Usage
    Add it as a plugin in sanity.config.ts (or .js):

    \`\`\`
     import {defineConfig} from 'sanity'
     import {myPlugin} from '${pluginName}'

     export const defineConfig({
         //...
         plugins: [
             myPlugin({})
         ]
     })
    \`\`\`
    ${getLicenseText(license?.id, user?.name ? (user as User) : undefined)}
    ${developTestSnippet()}
  `
}

export function installationSnippet(packageName: string) {
  return outdent`
    ## Installation

    \`\`\`
    npm install --save ${packageName}@studio-v3
    \`\`\`
    `
}

export function developTestSnippet() {
  return outdent`
    ## Develop & test

    This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
    with default configuration for build & watch scripts.

    See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
    on how to run this plugin with hotreload in the studio.
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
    licenseText = `${licenseText}\n[${licenseName}](LICENSE) © ${user?.name}\n`
  } else if (licenseName) {
    licenseText = `${licenseText}\n[${licenseName}](LICENSE)\n`
  } else {
    licenseText = `${licenseText}\nSee [LICENSE](LICENSE)`
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
