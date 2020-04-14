const path = require('path')
const meow = require('meow')
const pkg = require('../../package.json')
const build = require('../actions/build')

const description = `Verify, build and compile a Sanity plugin`

const help = `
Usage
  $ ${pkg.name} build [<dir>]

Examples
  # Build the plugin in the current directory
  $ ${pkg.name} build

  # Build the plugin in ~/my-plugin
  $ ${pkg.name} build ~/my-plugin

  # Allow package.json to reference files inside the uncompiled source folder
  $ ${pkg.name} build --allow-source-target
`

const flags = {
  allowSourceTarget: {
    type: 'boolean',
    default: false,
  },
}

function run({argv}) {
  const cli = meow(help, {flags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())
  return build({basePath, flags: cli.flags})
}

module.exports = run
