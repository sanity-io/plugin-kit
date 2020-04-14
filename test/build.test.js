const fs = require('fs')
const path = require('path')
const util = require('util')
const execa = require('execa')
const readdirp = require('readdirp')
const tap = require('tap')
const pkg = require('../package.json')

const rimraf = util.promisify(require('rimraf'))
const readFileRaw = util.promisify(fs.readFile)
const readFile = (file) => readFileRaw(file, 'utf8')
const baseFixturesDir = path.join(__dirname, 'fixtures')
const sanipack = path.resolve(__dirname, '..', pkg.bin.sanipack)
const onlyPaths = (files) => files.map((file) => file.path)
const contents = (dir) => readdirp.promise(dir).then(onlyPaths)

tap.test('can build valid plugin (in cwd)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build'], {cwd: fixtureDir})
  t.equal(stderr, '')
  t.includes(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), ['one.js', 'two.js', 'styles/one.css'])
  t.includes(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.includes(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('can build valid plugin (specified path)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build', fixtureDir])
  t.equal(stderr, '')
  t.includes(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), ['one.js', 'two.js', 'styles/one.css'])
  t.includes(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.includes(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('can build typescript plugin', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'ts')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build'], {cwd: fixtureDir})
  t.equal(stderr, '')
  t.includes(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), ['one.js', 'two.js', 'styles/one.css'])
  t.includes(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.includes(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('throws on missing package.json', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'no-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'No package.json found')
})

tap.test('throws on missing sanity.json', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'no-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'No sanity.json found')
})

tap.test('throws on package.json being... not a file', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'folder-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'EISDIR')
})

tap.test('throws on sanity.json being... not a file', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'folder-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'EISDIR')
})

tap.test('throws on package.json being invalid JSON', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Unexpected token')
})

tap.test('throws on sanity.json being invalid JSON', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Unexpected token')
})

tap.test('throws on package.json being invalid JSON (not an object)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-package-json-shape')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Root must be an object')
})

tap.test('throws on sanity.json being invalid JSON (not an object)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-sanity-json-shape')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Root must be an object')
})

tap.test('throws on package.json being invalid (non-string name)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'misnamed-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"name" must be a string')
})

tap.test('throws on sanity.json being invalid (non-boolean root)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonbool-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"root" property must be a boolean')
})

tap.test('throws on package.json being invalid (not allowed npm name)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'disallowed-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'name can only contain URL-friendly characters')
})

tap.test('throws on sanity.json being invalid (contains project props)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'disallowed-sanity-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'Keys "api", "project" are not allowed')
})

tap.test('throws on package.json being invalid (unscoped without plugin prefix)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'unprefixed-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'prefixed with "sanity-plugin-"')
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

tap.test('throws on package.json being invalid (non-string "main")', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'nonstring-main-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"main" must be a string if defined')
})

tap.test('throws on package.json being invalid (references source dir)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'sourced-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"main" points to file within source')
})

tap.test('throws on package.json being invalid (references orphaned file)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'orphaned-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"main" points to file that will not exist after compiling')
})

tap.test('throws on package.json being invalid (references missing file)', async (t) => {
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

tap.test('throws on package.json being invalid (references file without `paths`)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'pathless-package-json')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, '"main" points to file that does not exist')
})

tap.test('throws on double lockfile', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'double-lockfile')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', fixtureDir], {reject: false})
  t.equal(stdout, '')
  t.equal(exitCode, 1)
  t.includes(stderr, 'contains both package-lock.json and yarn.lock')
})
