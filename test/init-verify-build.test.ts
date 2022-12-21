import path from 'path'
import execa from 'execa'
import tap from 'tap'
import {contents, initTestArgs, normalize, runCliCommand, testFixture} from './fixture-utils'
import outdent from 'outdent'

tap.test('plugin-kit init -> verify-package -> tsc > pkg-utils build', async (t) => {
  await testFixture({
    fixturePath: 'init/empty',
    relativeOutPath: 'buildable',
    command: async ({outputDir}) => {
      // using console.error: we want these logged continuously to not surprise devs on the runtime
      console.error(
        'Integration testing init -> verify-package -> tsc -> build.\nThis may take a while...'
      )
      let start = new Date().getTime()
      function seconds() {
        return `${(new Date().getTime() - start) / 1000}s`
      }
      const init = await runCliCommand('init', [outputDir, ...initTestArgs])
      console.error(
        `"plugin-kit init" done in ${seconds()}.\nRunning "plugin-kit verify-package"...`
      )

      start = new Date().getTime()
      const verify = await runCliCommand('verify-package', [outputDir])
      console.error(`"plugin-kit verify-package" done in ${seconds()}.\nRunning "tsc --build"...`)

      start = new Date().getTime()
      const tsc = await execa('tsc', ['--build'], {cwd: outputDir})
      console.error(`"tsc --build" done in ${seconds()}.\nRunning "pkg-utils build"...`)

      start = new Date().getTime()
      const build = await execa('pkg-utils', ['build'], {cwd: outputDir})
      console.error(`"pkg-utils build" done in ${seconds()}.`)

      return {
        stdout: outdent`
          ${init.stdout}
          ${verify.stdout}
          ${tsc.stdout}
          ${build.stdout}
        `,
        stderr: outdent`
          ${init.stderr}
          ${verify.stderr}
          ${tsc.stderr}
          ${build.stderr}
        `,
      } as any
    },

    assert: async ({result: {stdout, stderr}, outputDir}) => {
      const trimmedErrors = stderr
        .split('\n')
        .filter((line) => !line.trim()) // remove empty lines
        .join('\n')
        .trim()
      t.equal(trimmedErrors, '', 'should have empty stderr')

      t.strictSame(
        await contents(path.join(outputDir, 'dist')),
        ['index.d.ts', 'index.esm.js', 'index.esm.js.map', 'index.js', 'index.js.map'].map(
          normalize
        ),
        'should output expected files to dist'
      )
    },
  })
})
