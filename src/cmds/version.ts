import meow from 'meow'
import pkg from '../../package.json'
import log from '../util/log'
import sharedFlags from '../sharedFlags'

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
  ...sharedFlags,

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
} as const

function run({argv}: {argv: string[]}) {
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
      `--major, --minor and --patch are mutually exclusive - only one can be used at a time`,
    )
  }

  const partIndex = versionNames.indexOf(versionFlag)
  log.msg(versionParts[partIndex])
}

export default run
