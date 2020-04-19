const path = require('path')
const meow = require('meow')
const pkg = require('../../package.json')
const build = require('../actions/build')
const log = require('../util/log')

const allowedSourceMaps = ['true', 'false', 'inline', 'both']
const description = `Verify, build and compile a Sanity plugin`

const help = `
Usage
  $ ${pkg.binname} build [<dir>]

Options
  --source-maps, -s [${allowedSourceMaps.join('|')}]
  --silent      Do not print info and warning messages
  --verbose     Log everything. This option conflicts with --silent
  --version     Output the version number
  --help        Output usage information

Examples
  # Build the plugin in the current directory
  $ ${pkg.binname} build

  # Build the plugin in ~/my-plugin, don't print info/warning messages
  $ ${pkg.binname} build ~/my-plugin --silent

  # Build the plugin in the current directory, generate inline sourcemaps
  $ ${pkg.binname} build ~/my-plugin --source-maps inline

  # Allow package.json to reference files inside the uncompiled source folder
  $ ${pkg.binname} build --allow-source-target
`

const flags = {
  allowSourceTarget: {
    type: 'boolean',
    default: false,
  },
  silent: {
    type: 'boolean',
    default: false,
  },
  verbose: {
    type: 'boolean',
    default: false,
  },
  sourceMaps: {
    type: 'string',
    default: 'true',
    alias: 's',
  },
}

function run({argv}) {
  const cli = meow(help, {flags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())
  if (!allowedSourceMaps.includes(cli.flags.sourceMaps)) {
    log.error(`Invalid --source-maps option: "${cli.flags.sourceMaps}"`)
    cli.showHelp() // Exits
  }

  return build({basePath, flags: cli.flags})
}

module.exports = run
