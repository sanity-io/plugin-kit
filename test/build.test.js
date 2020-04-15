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

const expectedFiles = ['one.js', 'one.js.map', 'two.js', 'two.js.map', 'styles/one.css']

tap.test('can build valid plugin (in cwd)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build'], {cwd: fixtureDir})
  t.equal(stderr, '')
  t.includes(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), expectedFiles)
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
  t.includes(stdout, '/valid/src')
  t.includes(stdout, '/valid/lib')
  t.includes(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), expectedFiles)
  t.includes(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.includes(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('can build valid plugin (silently)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid')
  const outputDir = path.join(fixtureDir, 'lib')

  await rimraf(outputDir)

  const {stdout, stderr} = await execa(sanipack, ['build', fixtureDir, '--silent'])
  t.equal(stderr, '')
  t.equal(stdout, '')
  t.strictSame(await contents(outputDir), expectedFiles)
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
  t.includes(stdout, '/ts/src')
  t.includes(stdout, '/ts/lib')
  t.includes(stdout, 'compiled 2 files')
  t.strictSame(await contents(outputDir), expectedFiles)
  t.includes(await readFile(path.join(outputDir, 'one.js')), 'interopRequireDefault')
  t.includes(await readFile(path.join(outputDir, 'styles', 'one.css')), 'bf1942')

  await rimraf(outputDir)
})

tap.test('can "build" (skip) plugin without compilation', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'plain')
  const {stdout, stderr} = await execa(sanipack, ['build'], {cwd: fixtureDir})
  const before = await contents(fixtureDir)
  t.includes(stderr, 'will not compile')
  t.equal(stdout, '')
  t.strictSame(await contents(fixtureDir), before)
})

tap.test('can "build" (skip) plugin without compilation (silent)', async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'plain')
  const {stdout, stderr} = await execa(sanipack, ['build', '--silent'], {cwd: fixtureDir})
  const before = await contents(fixtureDir)
  t.equal(stderr, '')
  t.equal(stdout, '')
  t.strictSame(await contents(fixtureDir), before)
})
