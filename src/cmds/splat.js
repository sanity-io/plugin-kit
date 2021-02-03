const path = require('path')
const meow = require('meow')
const pkg = require('../../package.json')
const log = require('../util/log')
const splat = require('../actions/splat')
const {hasSanityJson} = require('../sanity/manifest')
const sharedFlags = require('../sharedFlags')

const description = `"Splat" configuration into a Sanity plugin`

const help = `
Usage
  $ ${pkg.binname} splat [<dir>]

Options
  --no-eslint        Disables ESLint config and dependencies from being added
  --no-prettier      Disables prettier config and dependencies from being added
  --no-license       Disables LICENSE + package.json license field from being added
  --no-editorconfig  Disables .editorconfig from being added
  --no-gitignore     Disables .gitignore from being added
  --no-scripts       Disables scripts from being added to package.json
  --license [spdx]   Use the license with the given SPDX identifier

Examples
  # Splat configuration into the plugin in the current directory
  $ ${pkg.binname} splat

  # Splat configuration into the plugin in ~/my-plugin
  $ ${pkg.binname} splat ~/my-plugin

  # Don't add eslint or prettier
  $ ${pkg.binname} splat --no-eslint --no-prettier
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
      `sanity.json has a "root" property set to true - are you trying to splat into a studio instead of a plugin?`
    )
  }

  if (!exists) {
    throw new Error(
      `sanity.json does not exist in this directory, maybe you want "${pkg.binname} init" instead?`
    )
  }

  await splat({basePath, flags: cli.flags})

  log.info('Done!')
}

module.exports = run
