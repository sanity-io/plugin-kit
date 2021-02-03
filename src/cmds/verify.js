const path = require('path')
const meow = require('meow')
const pkg = require('../../package.json')
const verify = require('../actions/verify')
const sharedFlags = require('../sharedFlags')

const description = `Verify that a Sanity plugin is ready for publishing`

const help = `
Usage
  $ ${pkg.binname} verify [<dir>]

Examples
  # Verify the plugin in the current directory
  $ ${pkg.binname} verify

  # Verify the plugin in ~/my-plugin
  $ ${pkg.binname} verify ~/my-plugin

  # Allow package.json to reference files inside the uncompiled source folder
  $ ${pkg.binname} verify --allow-source-target
`

const flags = {
  ...sharedFlags,
  allowSourceTarget: {
    type: 'boolean',
    default: false,
  },
}

function run({argv}) {
  const cli = meow(help, {flags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())
  return verify({basePath, flags: cli.flags})
}

module.exports = run
