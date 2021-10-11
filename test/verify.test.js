const path = require('path')
const execa = require('execa')
const tap = require('tap')
const pkg = require('../package.json')

const baseFixturesDir = path.join(__dirname, 'fixtures', 'verify')
const sanipack = path.resolve(__dirname, '..', pkg.bin.sanipack)
const normalize = (dirPath) => dirPath.replace(/\//g, path.sep)
const options = {timeout: 15000}

tap.test('can verify valid plugin (in cwd)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid-built')
  const {stdout, stderr} = await execa(sanipack, ['verify'], {cwd: fixtureDir})
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, 'good to publish', 'should have success in stdout')
})

tap.test('can verify valid plugin (specified path)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid-built')
  const {stdout, stderr} = await execa(sanipack, ['verify', normalize(fixtureDir)])
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, 'good to publish', 'should have success in stdout')
})

tap.test('throws on missing license key', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'missing-license-key')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, 'missing "license" key')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('throws on missing license file', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'missing-license')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, 'does not contain a LICENSE-file')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('throws on non-spdx license', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'non-spdx-license')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, 'SPDX license ID')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('throws on referenced files being ignored by npm (package.json)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'npm-ref-ignored-file')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, 'ignored from being published: "types.d.ts"')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('throws on referenced files being ignored by npm (sanity.json)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'part-ref-ignored-file')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, 'ignored from being published: "lib/ignored.js"')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('throws on invalid dist config', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-dist-config')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, 'must be an object, got:\n[]')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('throws on invalid dist config (syntax)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'invalid-dist-config-syntax')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, 'Unexpected end of JSON input')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('warns on "useless" files', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'useless-files')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, '".eslintignore", ".prettierrc"')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 0)
})

tap.test('verifies plugin with no compilation', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'plain')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, 'good to publish', 'should have success in stdout')
  t.equal(exitCode, 0)
})

tap.test('verifies plugin with CSS-part referenced', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'css-part')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, 'good to publish', 'should have success in stdout')
  t.equal(exitCode, 0)
})

tap.test('verifies plugin with CSS-part referenced (missing)', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'css-part-missing')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, `references file ("styles/one.css") that does not exist in compiled`)
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1)
})

tap.test('verifies plugin with import referencing missing CSS file', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'css-import')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, /unable to resolve.*?one\.css.*?did you mean.*?One.css/i)
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1)
})

tap.test('verifies plugin with import referencing missing ?raw CSS file', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'css-raw-import-missing')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, /unable to resolve.*?one\.css.*?did you mean.*?One.css/i)
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1)
})

tap.test('verifies plugin with import referencing valid ?raw CSS file', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'css-raw-import')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, 'good to publish', 'should have success in stdout')
  t.equal(exitCode, 1)
})

tap.test('verifies plugin with css modules referencing missing CSS file', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'css-bad-composes')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, /unable to resolve.*?baseButton\.css/i)
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1)
})

tap.test('verifies plugin with css importing incorrectly cased CSS file', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'css-bad-import')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.match(stderr, /unable to resolve.*?Button\.css.*?did you mean.*?button.css/i)
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1)
})

tap.test('verifies valid plugin with mixed css imports', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'valid-kitchen-sink')
  const {stdout, stderr, exitCode} = await execa(sanipack, ['verify', normalize(fixtureDir)], {
    reject: false,
  })
  t.equal(stderr, '', 'should have empty stderr')
  t.match(stdout, 'good to publish', 'should have success in stdout')
  t.equal(exitCode, 0)
})

tap.test('throws on using @sanity/ui as peer dependency', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'ui-peer-dep')
  const {exitCode, stdout, stderr} = await execa(sanipack, ['verify'], {
    cwd: fixtureDir,
    reject: false,
  })
  t.match(stderr, '"@sanity/ui" declared as a peer dependency')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('throws on using @sanity/icons as peer dependency', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'icons-peer-dep')
  const {exitCode, stdout, stderr} = await execa(sanipack, ['verify'], {
    cwd: fixtureDir,
    reject: false,
  })
  t.match(stderr, '"@sanity/icons" declared as a peer dependency')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})

tap.test('throws on using @sanity/ui < 0.33.1', options, async (t) => {
  const fixtureDir = path.join(baseFixturesDir, 'ui-low-version')
  const {exitCode, stdout, stderr} = await execa(sanipack, ['verify'], {
    cwd: fixtureDir,
    reject: false,
  })
  t.match(stderr, '"@sanity/ui" dependency must use version higher than or equal to 0.33.1')
  t.equal(stdout, '', 'should have empty stdout')
  t.equal(exitCode, 1, 'should have exit code 1')
})
