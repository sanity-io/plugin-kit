import {URL} from 'url'
import path from 'path'
import inquirer from 'inquirer'
// @ts-expect-error missing types
import validNpmName from 'validate-npm-package-name'
// @ts-expect-error missing types
import githubUrlToObject from 'github-url-to-object'
import {InjectOptions} from '../actions/inject'

export async function prompt(
  message: string,
  options: {
    choices?: any
    type?: string
    default?: any
    filter?: (val: any) => any
    validate?: (val: any) => boolean | string
  }
) {
  const type = options.choices ? 'list' : options.type
  const result = await inquirer.prompt([{...options, type, message, name: 'single'}])
  return result && result.single
}

prompt.separator = () => new inquirer.Separator()

export function promptForPackageName({basePath}: InjectOptions, defaultVal?: string) {
  return prompt('Plugin name (sanity-plugin-...)', {
    default: defaultVal || path.basename(basePath),
    filter: (name) => {
      const prefixless = name.trim().replace(/^sanity-plugin-/, '')
      return name[0] === '@' ? name : `sanity-plugin-${prefixless}`
    },
    validate: (name) => {
      const valid: {errors?: string[]} = validNpmName(name)
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

export function promptForRepoOrigin(options: InjectOptions, defaultVal?: string) {
  return prompt('Git repository URL', {
    default: defaultVal,
    filter: (raw) => {
      const url = (raw || '').trim()
      const gh: {user: string; repo: string} | undefined = githubUrlToObject(url)
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
