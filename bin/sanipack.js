#!/usr/bin/env node
'use strict'
const meow = require('meow')

const cli = meow(
  `
	Usage
	  $ sanipack <command>

	Options
	  --base-path  Base path of plugin (default is current working dir)

	Examples
	  $ sanipack build
`,
  {
    flags: {
      basePath: {
        type: 'string',
      },
    },
  }
)

const commands = {
  build: {
    load: () => require('../src/cmds/build'),
  },
}

const command = cli.input[0]

if (!command) {
  cli.showHelp() // Exits
}

if (!(command in commands)) {
  console.error(`Unknown command "${command}"`)
  cli.showHelp() // Exits
}

// Lazy-load command
const cmd = commands[command].load()

// And run it
cmd({
  flags: cli.flags,
  args: cli.input.slice(1),
  showHelp: () => cli.showHelp(),
  basePath: cli.flags.basePath || process.cwd(),
})
