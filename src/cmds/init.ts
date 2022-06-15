import path from 'path'
import meow from 'meow'
import log from '../util/log'
import {init, initFlags} from '../actions/init'
import {isEmptyish, ensureDir} from '../util/files'
import {installDependencies, promptForPackageManager} from '../npm/manager'
import {findStudioV3Config, hasSanityJson} from '../sanity/manifest'
import {prompt} from '../util/prompt'
import {cliName} from '../constants'

const description = `Initialize a new Sanity plugin`

const help = `
Usage
  $ ${cliName} init [dir] [<args>]

Options
  --no-eslint             Disables ESLint config and dependencies from being added
  --no-prettier           Disables prettier config and dependencies from being added
  --no-typescript         Disables typescript config and dependencies from being added
  --no-license            Disables LICENSE + package.json license field from being added
  --no-editorconfig       Disables .editorconfig from being added
  --no-gitignore          Disables .gitignore from being added
  --no-scripts            Disables scripts from being added to package.json
  --no-install            Disables automatically running package manager install

  --name [package-name]   Use the provided package-name
  --author [name]         Use the provided author
  --repo [url]            Use the provided repo url
  --license [spdx]        Use the license with the given SPDX identifier
  --force                 No promt when overwriting files

Examples
  # Initialize a new plugin in the current directory
  $ ${cliName} init

  # Initialize a plugin in the directory ~/my-plugin
  $ ${cliName} init ~/my-plugin

  # Don't add eslint or prettier
  $ ${cliName} init --no-eslint --no-prettier
`

async function run({argv}: {argv: string[]}) {
  const cli = meow(help, {flags: initFlags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())

  const {exists, isRoot} = await hasSanityJson(basePath)
  if (exists && isRoot) {
    throw new Error(
      `sanity.json has a "root" property set to true - are you trying to init into a studio instead of a plugin?`
    )
  }

  const {v3ConfigFile} = await findStudioV3Config(basePath)
  if (v3ConfigFile) {
    throw new Error(
      `${v3ConfigFile} exsists - are you trying to init into a studio instead of a plugin?`
    )
  }

  log.info('Initializing new plugin in "%s"', basePath)
  if (
    !cli.flags.force &&
    !(await isEmptyish(basePath)) &&
    !(await prompt('Directory is not empty, proceed?', {type: 'confirm', default: false}))
  ) {
    log.error('Directory is not empty. Cancelled.')
    return
  }

  await ensureDir(basePath)
  await init({basePath, flags: cli.flags})
  if (cli.flags.install) {
    if (await installDependencies(await promptForPackageManager(), {cwd: basePath})) {
      log.info('Done!')
    } else {
      log.error('Failed to install dependencies, try manually running `npm install`')
    }
  } else {
    log.info('Dependency installation skipped.')
  }
}

export default run
