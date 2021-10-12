const path = require('path')
const execa = require('execa')
const tap = require('tap')
const pkg = require('../package.json')

const sanipack = path.resolve(__dirname, '..', pkg.bin.sanipack)
const normalize = (dirPath) => dirPath.replace(/\//g, path.sep)

tap.test('shows help if no command is given', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, {reject: false})
  t.equal(exitCode, 2, 'should have exit code 2')
  t.equal(stderr, '')
  t.match(stdout, pkg.description)
  t.match(stdout, pkg.binname)
})

tap.test('shows error + help on unknown commands', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, ['lolwat'], {reject: false})
  t.equal(exitCode, 2, 'should have exit code 2')
  t.equal(stderr, 'Unknown command "lolwat"')
  t.match(stdout, pkg.description)
  t.match(stdout, pkg.binname)
})

tap.test('shows error + help when using both --silent and --verbose', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, ['version', '--silent', '--verbose'], {
    reject: false,
  })
  t.equal(exitCode, 2, 'should have exit code 2')
  t.match(stderr, '--silent and --verbose are mutually exclusive')
  t.match(stdout, pkg.description)
  t.match(stdout, pkg.binname)
})

tap.test('shows no stack trace without --debug', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, ['version', '--major', '--minor'], {
    reject: false,
  })
  t.equal(exitCode, 1, 'should have exit code 1')
  t.equal(stdout, '', 'should have empty stdout')
  t.match(stderr, 'only one can be used at a time')
  t.notMatch(stderr, normalize('/cmds/version.js:'))
})

tap.test('shows stack trace with --debug', async (t) => {
  const {stdout, stderr, exitCode} = await execa(
    sanipack,
    ['version', '--debug', '--major', '--minor'],
    {reject: false}
  )
  t.equal(exitCode, 1, 'should have exit code 1')
  t.equal(stdout, '', 'should have empty stdout')
  t.match(stderr, 'only one can be used at a time')
  t.match(stderr, path.normalize('/cmds/version.js'))
})
