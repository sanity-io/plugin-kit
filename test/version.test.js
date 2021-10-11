const path = require('path')
const execa = require('execa')
const tap = require('tap')
const pkg = require('../package.json')

const sanipack = path.resolve(__dirname, '..', pkg.bin.sanipack)

tap.test('shows full version if no flag is given', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, ['version'], {reject: false})
  t.equal(exitCode, 0, 'should have exit code 0')
  t.equal(stderr, '', 'stderr should be empty')
  t.equal(stdout, `${pkg.name} version ${pkg.version}`)
})

tap.test('shows major version if --major is given', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, ['version', '--major'], {reject: false})
  t.equal(exitCode, 0, 'should have exit code 0')
  t.equal(stderr, '', 'stderr should be empty')
  t.equal(stdout, pkg.version.split('.')[0])
})

tap.test('shows minor version if --minor is given', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, ['version', '--minor'], {reject: false})
  t.equal(exitCode, 0, 'should have exit code 0')
  t.equal(stderr, '', 'stderr should be empty')
  t.equal(stdout, pkg.version.split('.')[1])
})

tap.test('shows patch version if --patch is given', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, ['version', '--patch'], {reject: false})
  t.equal(exitCode, 0, 'should have exit code 0')
  t.equal(stderr, '', 'stderr should be empty')
  t.equal(stdout, pkg.version.split('.')[2])
})

tap.test('throws if two version flags are given', async (t) => {
  const {stdout, stderr, exitCode} = await execa(sanipack, ['version', '--major', '--minor'], {
    reject: false,
  })
  t.equal(exitCode, 1, 'exit code should be 1')
  t.equal(stdout, '', 'stdout should be empty')
  t.match(stderr, 'only one can be used at a time')
})
