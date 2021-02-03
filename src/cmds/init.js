const path = require('path')
const meow = require('meow')
const pkg = require('../../package.json')
const log = require('../util/log')
const init = require('../actions/init')
const {isEmptyish, ensureDir} = require('../util/files')
const {installDependencies, promptForPackageManager} = require('../npm/manager')
const {hasSanityJson} = require('../sanity/manifest')
const {prompt} = require('../util/prompt')
const sharedFlags = require('../sharedFlags')

const description = `Initialize a new Sanity plugin`

const help = `
Usage
  $ ${pkg.binname} init [<dir>]

Options
  --no-eslint        Disables ESLint config and dependencies from being added
  --no-prettier      Disables prettier config and dependencies from being added
  --no-license       Disables LICENSE + package.json license field from being added
  --no-editorconfig  Disables .editorconfig from being added
  --no-gitignore     Disables .gitignore from being added
  --no-scripts       Disables scripts from being added to package.json
  --license [spdx]   Use the license with the given SPDX identifier

Examples
  # Initialize a new plugin in the current directory
  $ ${pkg.binname} init

  # Initialize a plugin in the directory ~/my-plugin
  $ ${pkg.binname} init ~/my-plugin

  # Don't add eslint or prettier
  $ ${pkg.binname} init --no-eslint --no-prettier
`

const flags = {
  ...sharedFlags,
  eslint: {
    type: 'boolean',
    default: true,
  },
  prettier: {
    type: 'boolean',
    default: true,
  },
  license: {
    type: 'string',
  },
  editorconfig: {
    type: 'boolean',
    default: true,
  },
  gitignore: {
    type: 'boolean',
    default: true,
  },
  scripts: {
    type: 'boolean',
    default: true,
  },
}

async function run({argv}) {
  const cli = meow(help, {flags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())

  const {exists, isRoot} = await hasSanityJson(basePath)
  if (exists && isRoot) {
    throw new Error(
      `sanity.json has a "root" property set to true - are you trying to init into a studio instead of a plugin?`
    )
  }

  log.info('Initializing new plugin in "%s"', basePath)
  if (
    !(await isEmptyish(basePath)) &&
    !(await prompt('Directory is not empty, proceed?', {type: 'confirm', default: false}))
  ) {
    log.error('Directory is not empty. Cancelled.')
    return
  }

  await ensureDir(basePath)
  await init({basePath, flags: cli.flags})
  if (await installDependencies(await promptForPackageManager(), {cwd: basePath})) {
    log.info('Done!')
  } else {
    log.error('Failed to install dependencies, try manually running `npm install`')
  }
}

module.exports = run
