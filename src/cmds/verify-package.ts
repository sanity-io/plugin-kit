import path from 'path'
import meow from 'meow'
import {verifyPackage} from '../actions/verify-package'
import {cliName} from '../constants'
import {verifyFlags} from '../actions/verify/verify-common'

const description = `Verify that a Sanity plugin package is v3 compatible, and print upgrade steps if not.`

const help = `
Usage
  $ ${cliName} verify-package [dir] [<args>]

Options
  --single      Enables fail-fast mode: Will only output the first validation that fails.
  --silent      Do not print info and warning messages
  --verbose     Log everything. This option conflicts with --silent
  --version     Output the version number
  --help        Output usage information

Each check will describe how they can be individually disabled.

Examples
  # Verify Sanity plugin package in current directory
  $ ${cliName} verify-package

  # Verify Sanity plugin package in my-plugin directory in silent mode
  $ ${cliName} verify-package my-plugin-directory --silent
`

function run({argv}: {argv: string[]}) {
  const cli = meow(help, {flags: verifyFlags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())
  return verifyPackage({basePath, flags: cli.flags})
}

export default run
