const path = require('path')
const execa = require('execa')
const tap = require('tap')
const pkg = require('../package.json')

const baseFixturesDir = path.join(__dirname, 'fixtures')
const sanipack = path.resolve(__dirname, '..', pkg.bin.sanipack)
const options = {timeout: 15000}

tap.test('throws on missing package.json', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'no-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'No package.json found')
})

tap.test('throws on package.json being... not a file', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'folder-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'EISDIR')
})

tap.test('throws on package.json being invalid JSON', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Unexpected token')
})

tap.test('throws on package.json being invalid JSON (not an object)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-package-json-shape')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Root must be an object')
})

tap.test('throws on package.json being invalid (non-string name)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'misnamed-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"name" must be a string')
})

tap.test('throws on package.json being invalid (not allowed npm name)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'disallowed-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'name can only contain URL-friendly characters')
})

tap.test('throws on package.json being invalid (unscoped without plugin prefix)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'unprefixed-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'prefixed with "sanity-plugin-"')
})

tap.test('throws on package.json being invalid (non-string "main")', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonstring-main-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"main" must be a string if defined')
})

tap.test('throws on package.json being invalid (references source dir)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'sourced-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"main" points to file within source')
})

tap.test('throws on package.json being invalid (references orphaned file)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'orphaned-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"main" points to file that will not exist after compiling')
})

tap.test('throws on package.json being invalid (references missing file)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'targetless-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(
    stderr,
    '"main" points to file that does not exist, and no equivalent is found in source directory'
  )
})

tap.test(
  'throws on package.json being invalid (references missing file outside source directory)',
  async (t) => {
    const fixtureDir = path.join(baseFixturesDir, 'outscoped-package-json')
    const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
    t.equal(stdout, '')
    t.equal(exitCode, 1)
    t.includes(
      stderr,
      '"main" points to file that does not exist, and "paths" is not configured to compile to this location'
    )
  }
)

tap.test('throws on package.json being invalid (references file without `paths`)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'pathless-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"main" points to file that does not exist')
})

tap.test('throws on double lockfile', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'double-lockfile')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'contains both package-lock.json and yarn.lock')
})
