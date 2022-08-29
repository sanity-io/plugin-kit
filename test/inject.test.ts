import tap from 'tap'
import {fileContainsValidator, runCliCommand, testFixture} from './fixture-utils'
import path from 'path'
import {copySync} from 'fs-extra'

tap.test('plugin-kit inject --preset semver-workflow into existing plugin directory', async (t) => {
  await testFixture({
    fixturePath: 'inject/valid',
    relativeOutPath: '../semver-workflow',
    command: async ({fixtureDir, outputDir}) => {
      copySync(fixtureDir, outputDir)
      return runCliCommand('inject', [outputDir, '--preset-only', '--preset', 'semver-workflow'])
    },
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.equal(stderr, '', 'should have empty stderr')
      t.match(stdout, `Only apply presets, skipping default inject.`)
      t.match(stdout, `Inject config into plugin in "${outputDir}"`)

      const fileContains = fileContainsValidator(t, outputDir)

      // only check for a single file from the preset:
      // rest is covered by the init tests; it uses the same codepath
      await fileContains(path.join('.github', 'workflows', 'main.yml'), 'CI & Release')
    },
  })
})

tap.test('plugin-kit inject --preset renovatebot into existing plugin directory', async (t) => {
  await testFixture({
    fixturePath: 'inject/valid',
    relativeOutPath: '../renovatebot',
    command: async ({fixtureDir, outputDir}) => {
      copySync(fixtureDir, outputDir)
      return runCliCommand('inject', [outputDir, '--preset-only', '--preset', 'renovatebot'])
    },
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.equal(stderr, '', 'should have empty stderr')

      const fileContains = fileContainsValidator(t, outputDir)

      await fileContains(
        path.join('renovate.json'),
        '"github>sanity-io/renovate-presets//ecosystem/auto"'
      )
    },
  })
})

tap.test('plugin-kit inject --preset jest into existing plugin directory', async (t) => {
  await testFixture({
    fixturePath: 'inject/jest',
    relativeOutPath: '../renovatebot',
    command: async ({fixtureDir, outputDir}) => {
      copySync(fixtureDir, outputDir)
      return runCliCommand('inject', [outputDir, '--preset-only', '--preset', 'renovatebot'])
    },
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.equal(stderr, '', 'should have empty stderr')

      const fileContains = fileContainsValidator(t, outputDir)

      await fileContains('renovate.json', '"github>sanity-io/renovate-presets//ecosystem/auto"')
    },
  })
})

tap.test('plugin-kit inject --preset-only requires --preset', async (t) => {
  await testFixture({
    fixturePath: 'inject/valid',
    command: async ({fixtureDir}) => {
      return runCliCommand('inject', [fixtureDir, '--preset-only'])
    },
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.match(stderr, '--preset-only, but no --preset [preset-name] was provided.')
    },
  })
})

tap.test('plugin-kit inject --preset-only --preset does-not-exist', async (t) => {
  await testFixture({
    fixturePath: 'inject/valid',
    command: async ({fixtureDir}) => {
      return runCliCommand('inject', [fixtureDir, '--preset-only', '--preset', 'does-not-exist'])
    },
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.match(stderr, 'Unknown --preset(s): [does-not-exist]. Must be one of: [')
    },
  })
})
