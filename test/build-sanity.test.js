const path = require('path')
const execa = require('execa')
const tap = require('tap')
const pkg = require('../package.json')

const baseFixturesDir = path.join(__dirname, 'fixtures')
const sanipack = path.resolve(__dirname, '..', pkg.bin.sanipack)

tap.test('throws on missing sanity.json', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'no-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'No sanity.json found')
})

tap.test('throws on sanity.json being... not a file', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'folder-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'EISDIR')
})

tap.test('throws on sanity.json being invalid JSON', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Unexpected token')
})

tap.test('throws on sanity.json being invalid JSON (not an object)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-sanity-json-shape')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Root must be an object')
})

tap.test('throws on sanity.json being invalid (non-boolean root)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonbool-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"root" property must be a boolean')
})

tap.test('throws on sanity.json being invalid (contains project props)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'disallowed-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Keys "api", "project" are not allowed')
})

tap.test('throws on sanity.json being invalid (truthy root)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'disallowed-root-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"root" cannot be truthy in a plugin manifest')
})

tap.test('throws on sanity.json being invalid (non-object paths)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonobject-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"paths" must be an object if declared')
})

tap.test('throws on sanity.json being invalid (non-string compiled path)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonstring-compiled-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"paths" must have a (string) "compiled" property if declared')
})

tap.test('throws on sanity.json being invalid (non-string source path)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonstring-source-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"paths" must have a (string) "source" property if declared')
})

tap.test('throws on sanity.json being invalid (non-array parts)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonarray-parts-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"parts" must be an array if declared')
})

tap.test('throws on sanity.json being invalid (non-object part)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonobject-part-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"parts[0]" must be an object')
})

tap.test('throws on sanity.json being invalid (invalid part)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-part-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Keys "name", "path" should be of type string (parts[0])')
})

tap.test('throws on sanity.json being invalid (invalid part keys)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-part-keys-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Key "unknown" is not allowed in a part declaration (parts[1])')
})

tap.test('throws on sanity.json being invalid (unprefixed part)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'unprefixed-part-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(
    stderr,
    '"name" must be prefixed with "part:unprefixed-part-sanity-json/" - got "some-part-name" (parts[0])'
  )
})

tap.test('throws on sanity.json being invalid (unprefixed implementation)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'unprefixed-implementation-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"implements" must be prefixed with "part:" - got "some-part-name" (parts[0])')
})
