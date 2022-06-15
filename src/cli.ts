#!/usr/bin/env node
'use strict'
import meow from 'meow'
import log from './util/log'
import commands from './cmds'
import sharedFlags from './sharedFlags'
import {cliName} from './constants'

export async function cliEntry(argv = process.argv, autoExit = true) {
  const cli = meow(
    `
	Usage
	  $ ${cliName} [--help] [--debug] <command> [<args>]

  These are common commands used in various situations:

    init            Create a new Sanity plugin
    verify-package  Check that a Sanity plugin package follows V3 conventions. Prints upgrade steps.
    verify-studio   Check that a Sanity Studio follows V3 conventions. Prints upgrade steps.
    link-watch      Recompiles plugin automatically on changes and runs yalc push --publish
    version         Show the version of ${cliName} currently installed

  Options
    --silent        Do not print info and warning messages
    --verbose       Log everything. This option conflicts with --silent
    --debug         Print stack trace on errors
    --version       Output the version number
    --help          Output usage information

  Examples
    # Init a new plugin in current directory
    $ ${cliName} init

    # Init a new plugin in my-sanity-plugin directory
    $ ${cliName} init my-sanity-plugin

    # Check that a Sanity plugin package in current directory follows V3 conventions
    $ ${cliName} verify-package

    # Check that a Sanity Studio in current directory  follows V3 conventions
    $ ${cliName} verify-studio
`,
    {
      autoHelp: false,
      flags: sharedFlags,
      argv: argv.slice(2),
    }
  )

  const commandName = cli.input[0]
  if (!commandName) {
    cli.showHelp() // Exits
  }

  if (!(commandName in commands)) {
    console.error(`Unknown command "${commandName}"`)
    cli.showHelp() // Exits
  }

  if (cli.flags.silent && cli.flags.verbose) {
    log.error(`--silent and --verbose are mutually exclusive`)
    cli.showHelp() // Exits
  }

  // Lazy-load command
  const cmd = require(commands[commandName as keyof typeof commands]).default

  try {
    log.setVerbosity(cli.flags)
    await cmd({argv: argv.slice(3)})
  } catch (err: any) {
    log.error(err instanceof TypeError || cli.flags.debug ? err.stack : err.message)

    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
}
