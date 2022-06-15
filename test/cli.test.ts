import path from 'path'
import tap from 'tap'
import {runCliCommand} from './fixture-utils'
import {cliName} from '../src/constants'

const normalize = (dirPath: string) => dirPath.replace(/\//g, path.sep)
const helpString = 'These are common commands used in various situations'

tap.test('shows help if no command is given', async (t) => {
  const {stdout, stderr, exitCode} = await runCliCommand('', [])
  t.equal(exitCode, 2, 'should have exit code 2')
  t.equal(stderr, '')
  t.match(stdout, helpString)
  t.match(stdout, cliName)
})

tap.test('shows error + help on unknown commands', async (t) => {
  const {stdout, stderr, exitCode} = await runCliCommand('does-not-exist', [])
  t.equal(exitCode, 2, 'should have exit code 2')
  t.equal(stderr, 'Unknown command "does-not-exist"')
  t.match(stdout, helpString)
  t.match(stdout, cliName)
})

tap.test('shows error + help when using both --silent and --verbose', async (t) => {
  const {stdout, stderr, exitCode} = await runCliCommand('version', ['--silent', '--verbose'], {
    reject: false,
  })
  t.equal(exitCode, 2, 'should have exit code 2')
  t.match(stderr, '--silent and --verbose are mutually exclusive')
  t.match(stdout, helpString)
  t.match(stdout, cliName)
})

tap.test('shows no stack trace without --debug', async (t) => {
  const {stdout, stderr, exitCode} = await runCliCommand('version', ['--major', '--minor'], {
    reject: false,
  })
  t.equal(exitCode, 1, 'should have exit code 1')
  t.equal(stdout, '', 'should have empty stdout')
  t.match(stderr, 'only one can be used at a time')
  t.notMatch(stderr, normalize('/cmds/version.js:'))
})

tap.test('shows stack trace with --debug', async (t) => {
  const {stdout, stderr, exitCode} = await runCliCommand('version', [
    '--debug',
    '--major',
    '--minor',
  ])
  t.equal(exitCode, 1, 'should have exit code 1')
  t.equal(stdout, '', 'should have empty stdout')
  t.match(stderr, 'only one can be used at a time')
  t.match(stderr, path.normalize('/cmds/version.ts'))
})
