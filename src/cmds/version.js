const meow = require('meow')
const pkg = require('../../package.json')
const log = require('../util/log')

const description = `Show the installed version of ${pkg.name}`

const help = `
Usage
  $ ${pkg.binname} version

Options
  --major  Show only the major version
  --minor  Show only the minor version
  --patch  Show only the patch version

Examples
  $ ${pkg.binname} version
  ${pkg.name} version ${pkg.version}

  $ ${pkg.binname} version --major
  ${pkg.version.split('.')[0]}
`

const flags = {
  major: {
    type: 'boolean',
    default: false,
  },

  minor: {
    type: 'boolean',
    default: false,
  },

  patch: {
    type: 'boolean',
    default: false,
  },
}

function run({argv}) {
  const cli = meow(help, {flags, argv, description})
  const versionParts = pkg.version.split('.')
  const versionNames = ['major', 'minor', 'patch']
  const versionFlags = versionNames.filter((flagName) => cli.flags[flagName])
  const versionFlag = versionFlags[0]
  const numVersionFlags = versionFlags.length

  if (numVersionFlags === 0) {
    log.msg(`${pkg.name} version ${pkg.version}`)
    return
  }

  if (numVersionFlags > 1) {
    throw new Error(
      `--major, --minor and --patch are mutually exclusive - only one can be used at a time`
    )
  }

  const partIndex = versionNames.indexOf(versionFlag)
  log.msg(versionParts[partIndex])
}

module.exports = run
