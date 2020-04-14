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
