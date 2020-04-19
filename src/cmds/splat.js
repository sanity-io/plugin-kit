const path = require('path')
const meow = require('meow')
const pkg = require('../../package.json')
const splat = require('../actions/splat')

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

function run({argv}) {
  const cli = meow(help, {flags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())
  return splat({basePath, flags: cli.flags})
}

module.exports = run
