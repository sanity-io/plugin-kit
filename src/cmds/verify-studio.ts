import path from 'path'
import meow from 'meow'
import {cliName} from '../constants'
import {verifyFlags} from '../actions/verify/verify-common'
import {verifyStudio} from '../actions/verify-studio'

const description = `Verify that a Sanity Studio is configured correctly for v3, and print upgrade steps if not.`

const help = `
Usage
  $ ${cliName} verify-studio [dir] [<args>]

Options
  --single      Enables fail-fast mode: Will only output the first validation that fails.
  --silent      Do not print info and warning messages
  --verbose     Log everything. This option conflicts with --silent
  --version     Output the version number
  --help        Output usage information

Each check will describe how they can be individually disabled.

Examples
  # Verify Sanity Studio in current directory
  $ ${cliName} verify-studio

  # Verify Sanity Studio in my-sanity-studio directory in silent mode
  $ ${cliName} verify-studio my-sanity-studio --silent
`

function run({argv}: {argv: string[]}) {
  const cli = meow(help, {flags: verifyFlags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())
  return verifyStudio({basePath, flags: cli.flags})
}

export default run
