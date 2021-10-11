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
const baseFixturesDir = path.join(__dirname, 'fixtures', 'build')
const sanipack = path.resolve(__dirname, '..', pkg.bin.sanipack)
const onlyPaths = (files) => files.map((file) => file.path)
const contents = (dir) => readdirp.promise(dir).then(onlyPaths)
const normalize = (dirPath) => dirPath.replace(/\//g, path.sep)

const options = {timeout: 15000}
const expectedFiles = ['one.js', 'one.js.map', 'two.js', 'two.js.map', 'styles/one.css'].map(
  normalize
)

tap.test('can build valid plugin (in cwd)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build'], {cwd: fixtureDir})
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), expectedFiles)
  t.match(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.match(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('can build valid plugin (specified path)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build', fixtureDir])
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, '/valid/src')
  t.match(stdout, '/valid/lib')
  t.match(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), expectedFiles)
  t.match(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.match(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('can build valid plugin (silently)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build', fixtureDir, '--silent'])
  t.equal(stderr, '', 'should have empty stderr')
  t.equal(stdout, '', 'should have empty stdout')
  t.strictSame(await contents(outputDir), expectedFiles)
  t.match(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.match(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('can build typescript plugin', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'ts')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build'], {cwd: fixtureDir})
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, '/ts/src')
  t.match(stdout, '/ts/lib')
  t.match(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), expectedFiles)
  t.match(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.match(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('can "build" (skip) plugin without compilation', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'plain')
  const {stdout, stderr} = await execa(sanipack, ['build'], {cwd: fixtureDir})
  const before = await contents(fixtureDir)
  t.match(stderr, 'will not compile')
  t.equal(stdout, '', 'should have empty stdout')
  t.strictSame(await contents(fixtureDir), before)
})

tap.test('can "build" (skip) plugin without compilation (silent)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'plain')
  const {stdout, stderr} = await execa(sanipack, ['build', '--silent'], {cwd: fixtureDir})
  const before = await contents(fixtureDir)
  t.equal(stderr, '', 'should have empty stderr')
  t.equal(stdout, '', 'should have empty stdout')
  t.strictSame(await contents(fixtureDir), before)
})

tap.test('throws on invalid source map flag', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['build', '--source-maps', 'foo'], {
    cwd: fixtureDir,
    reject: false,
  })
  const before = await contents(fixtureDir)
  t.equal(exitCode, 2)
  t.match(stderr, 'Invalid --source-maps option: "foo"')
  t.match(stdout, '[true|false|inline|both]')
  t.strictSame(await contents(fixtureDir), before)
})
