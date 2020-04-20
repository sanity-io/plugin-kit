const {URL} = require('url')
const path = require('path')
const inquirer = require('inquirer')
const validNpmName = require('validate-npm-package-name')
const githubUrlToObject = require('github-url-to-object')

module.exports = {prompt, promptForPackageName, promptForRepoOrigin}

async function prompt(message, options = {}) {
  const type = options.choices ? 'list' : options.type
  const result = await inquirer.prompt([{...options, type, message, name: 'single'}])
  return result && result.single
}

prompt.separator = () => new inquirer.Separator()

function promptForPackageName({basePath}, defaultVal) {
  return prompt('Plugin name (sanity-plugin-...)', {
    default: defaultVal || path.basename(basePath),
    filter: (name) => {
      const prefixless = name.trim().replace(/^sanity-plugin-/, '')
      return name[0] === '@' ? name : `sanity-plugin-${prefixless}`
    },
    validate: (name) => {
      const valid = validNpmName(name)
      if (valid.errors) {
        return valid.errors[0]
      }

      if (name[0] !== '@' && name.endsWith('plugin')) {
        return `Name shouldn't include "plugin" multiple times (${name})`
      }

      return true
    },
  })
}

function promptForRepoOrigin(options, defaultVal) {
  return prompt('Git repository URL', {
    default: defaultVal,
    filter: (raw) => {
      const url = (raw || '').trim()
      const gh = githubUrlToObject(url)
      return gh ? `git+ssh://git@github.com/${gh.user}/${gh.repo}.git` : url
    },
    validate: (url) => {
      if (!url) {
        return true
      }

      try {
        const parsed = new URL(url)
        return parsed ? true : 'Invalid URL'
      } catch (err) {
        return 'Invalid URL'
      }
    },
  })
}
