#!/usr/bin/env node
'use strict'
const meow = require('meow')
const commands = require('../src/cmds')
const pkg = require('../package.json')

const cli = meow(
  `
	Usage
	  $ ${pkg.name} [--help] <command> [<args>]

  These are common commands used in various situations:

    build   Compile a Sanity plugin (prior to publishing)
    init    Create a new Sanity plugin
    splat   Inject ${pkg.name} into an existing Sanity plugin
    verify  Verify a Sanity plugin prior to publishing

	Examples
    $ ${pkg.name} build
`,
  {
    autoHelp: false,
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
cmd({
  parent: pkg.name,
  argv: process.argv.slice(3),
})
