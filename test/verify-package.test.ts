import tap from 'tap'
import {runCliCommand, testFixture} from './fixture-utils'
import {verifyPackageConfigDefaults} from '../src/actions/verify/verify-common'

tap.test('plugin-kit verify-package in package with all checks failing', async (t) => {
  await testFixture({
    fixturePath: 'verify-package/every-failure-possible',
    command: ({fixtureDir}) => runCliCommand('verify-package', [fixtureDir]),
    assert: async ({result: {stderr}}) => {
      const redactFilePaths = cleanupOutput(
        stderr,
        /[\S]+verify-package\/every-failure-possible\//g
      )

      // to regenerate the snapshot, in root dir run:
      // tap test/verify-package.test.ts --snapshot
      t.matchSnapshot(redactFilePaths, 'stderr should match snapshot')

      // checks that output contains the "skip this validation" snippet for every possible relevant key
      // will fail when new checks are added that we may or may not want to account for
      Object.keys(verifyPackageConfigDefaults)
        .filter((key) => !['tsc', 'studioConfig'].includes(key))
        .forEach((checkKey) => {
          const findString = `"${checkKey}": false`
          t.ok(stderr.includes(findString), `should include ${findString} in stderr`)
        })
    },
  })
})

tap.test('plugin-kit verify-package in ok package', async (t) => {
  await testFixture({
    fixturePath: 'verify-package/valid',
    command: ({fixtureDir}) => runCliCommand('verify-package', [fixtureDir]),
    assert: async ({result: {stdout, stderr}}) => {
      t.equal(stderr, '', 'stderr should be empty')

      // to regenerate the snapshot, in root dir run:
      // tap test/verify-package.test.ts --snapshot
      const redactFilePaths = cleanupOutput(stdout, /[\S]+verify-package\/valid\//g)
      t.matchSnapshot(redactFilePaths, 'stdout should match snapshot')
    },
  })
})

tap.test('plugin-kit verify-package in package with invalid eslint config', async (t) => {
  await testFixture({
    fixturePath: 'verify-package/invalid-eslint',
    command: ({fixtureDir}) => runCliCommand('verify-package', [fixtureDir]),
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      // to regenerate the snapshot, in root dir run:
      // tap test/verify-package.test.ts --snapshot
      const redactFilePaths = cleanupOutput(stderr, /[\S]+verify-package\/invalid-eslint\//g)
      t.matchSnapshot(redactFilePaths, 'stderr should match snapshot')
    },
  })
})

tap.test('plugin-kit verify-studio in fresh v2 studio', async (t) => {
  await testFixture({
    fixturePath: 'verify-package/fresh-v2-movie-studio',
    command: ({fixtureDir}) => runCliCommand('verify-studio', [fixtureDir]),
    assert: async ({result: {stdout, stderr}}) => {
      // to regenerate the snapshot, in root dir run:
      // tap test/verify-package.test.ts --snapshot
      const redactFilePaths = cleanupOutput(stderr, /[\S]+verify-package\/fresh-v2-movie-studio\//g)
      t.matchSnapshot(redactFilePaths, 'stderr should match snapshot')
    },
  })
})

function cleanupOutput(val: string, packagePath: RegExp) {
  return val
    .replace(packagePath, 'root/')
    .replace(/\((.+)\/node_modules\//g, 'root/node_modules/')
    .replace(/\[\d+m/g, '')
}
