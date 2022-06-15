import path from 'path'
import meow from 'meow'
import pkg from '../../package.json'
import sharedFlags from '../sharedFlags'
import {linkWatch} from '../actions/link-watch'

const description = `Run the watch command and pushes any changes to yalc`

const help = `
Usage
  $ ${pkg.binname} link-watch [<args>]

Options
  --silent      Do not print info and warning messages
  --verbose     Log everything. This option conflicts with --silent
  --version     Output the version number
  --help        Output usage information

Configuration
To override the default watch command configuration, provide an override in package.json under sanityPlugin:
{
  "sanityPlugin": {
    "watchCommand": "microbundle watch --format modern,esm,cjs --jsx React.createElement --jsxImportSource react --css inline",
    "linkWatch": {
      "folder": "lib",
      "command": "npm run watch",
      "extensions": "js,png,svg,gif,jpeg,css"
    }
  }
}

Examples
  # Run the watch command and pushes any changes to yalc
  $ ${pkg.binname} link-watch
`

const flags = {
  ...sharedFlags,
  watch: {
    type: 'boolean',
    default: false,
  },
} as const

function run({argv}: {argv: string[]}) {
  const cli = meow(help, {flags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())
  return linkWatch({basePath})
}

export default run
