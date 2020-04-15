const path = require('path')
const execa = require('execa')
const tap = require('tap')
const pkg = require('../package.json')

const baseFixturesDir = path.join(__dirname, 'fixtures')
const sanipack = path.resolve(__dirname, '..', pkg.bin.sanipack)

tap.test('can verify valid plugin (in cwd)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid-built')
  const {stdout, stderr} = await execa(sanipack, ['verify'], {cwd: fixtureDir})
  t.equal(stderr, '')
  t.equal(stdout, '')
})

tap.test('can verify valid plugin (specified path)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid-built')
  const {stdout, stderr} = await execa(sanipack, ['verify', fixtureDir])
  t.equal(stderr, '')
  t.equal(stdout, '')
})

tap.test('throws on missing license key', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'missing-license-key')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.includes(stderr, 'missing "license" key')
  t.equal(stdout, '')
  t.equal(exitCode, 1)
})

tap.test('throws on missing license file', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'missing-license')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.includes(stderr, 'does not contain the file "LICENSE"')
  t.equal(stdout, '')
  t.equal(exitCode, 1)
})

tap.test('throws on non-spdx license', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'non-spdx-license')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.includes(stderr, 'SPDX license ID')
  t.equal(stdout, '')
  t.equal(exitCode, 1)
})

tap.test('throws on referenced files being ignored by npm (package.json)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'npm-ref-ignored-file')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.includes(stderr, 'ignored from being published: "types.d.ts"')
  t.equal(stdout, '')
  t.equal(exitCode, 1)
})

tap.test('throws on referenced files being ignored by npm (sanity.json)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'part-ref-ignored-file')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.includes(stderr, 'ignored from being published: "lib/ignored.js"')
  t.equal(stdout, '')
  t.equal(exitCode, 1)
})

tap.test('throws on invalid dist config', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-dist-config')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.includes(stderr, 'must be an object, got:\n[]')
  t.equal(stdout, '')
  t.equal(exitCode, 1)
})

tap.test('throws on invalid dist config (syntax)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-dist-config-syntax')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.includes(stderr, 'Unexpected end of JSON input')
  t.equal(stdout, '')
  t.equal(exitCode, 1)
})

tap.test('warns on "useless" files', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'useless-files')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.includes(stderr, '".eslintignore", ".prettierrc"')
  t.equal(stdout, '')
  t.equal(exitCode, 0)
})

tap.test('verifies plugin with no compilation', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'plain')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', fixtureDir], {reject: false})
  t.equal(stderr, '')
  t.equal(stdout, '')
  t.equal(exitCode, 0)
})
