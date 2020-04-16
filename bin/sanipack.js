#!/usr/bin/env node
'use strict'
const meow = require('meow')
const log = require('../src/util/log')
const commands = require('../src/cmds')
const pkg = require('../package.json')

const cli = meow(
  `
	Usage
	  $ ${pkg.binname} [--help] [--debug] <command> [<args>]

  These are common commands used in various situations:

    build    Compile a Sanity plugin (prior to publishing)
    init     Create a new Sanity plugin
    splat    Inject ${pkg.name} into an existing Sanity plugin
    verify   Verify a Sanity plugin prior to publishing
    version  Show the version of ${pkg.name} currently installed

  Examples
    # Build a Sanity plugin for publishing
    $ ${pkg.binname} build

    # Verify that a Sanity plugin is ready to be published
    # (great for pre-publish step!)
    $ ${pkg.binname} verify
`,
  {
    autoHelp: false,
    flags: {
      debug: {
        default: false,
        type: 'boolean',
      },
    },
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

// Lazy-load command
const cmd = require(commands[commandName])

// And run it
async function sanipack() {
  try {
    await cmd({argv: process.argv.slice(3)})
  } catch (err) {
    log.error(err instanceof TypeError || cli.flags.debug ? err.stack : err.message)

    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
}

sanipack()
