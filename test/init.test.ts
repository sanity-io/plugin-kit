import tap from 'tap'
import {
  fileContainsValidator,
  normalize,
  readFile,
  runCliCommand,
  testFixture,
  pluginTestName,
  initTestArgs,
} from './fixture-utils'
import path from 'path'
import {fileExists} from '../src/util/files'
import {incompatiblePluginPackage} from '../src/constants'
import {PackageJson} from '../src/actions/verify/types'

const defaultDevDependencies = [
  '@sanity/plugin-kit',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint',
  'eslint-config-prettier',
  'eslint-config-sanity',
  'eslint-plugin-prettier',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'parcel',
  'prettier',
  'react',
  'rimraf',
  'sanity',
  'typescript',
]

tap.test('plugin-kit init --force in empty directory', async (t) => {
  await testFixture({
    fixturePath: 'init/empty',
    relativeOutPath: 'defaults',
    command: ({outputDir}) => runCliCommand('init', [outputDir, ...initTestArgs]),
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.equal(stderr, '', 'should have empty stderr')
      t.match(stdout, `Initializing new plugin in "${outputDir}"`)

      const fileContains = fileContainsValidator(t, outputDir)

      await fileContains('LICENSE', 'MIT')
      await fileContains('README.md', `# ${pluginTestName}`)
      await fileContains('.gitignore', 'lib', '.parcel-cache')
      await fileContains(
        '.eslintrc',
        'sanity',
        'sanity/typescript',
        'sanity/react',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended'
      )
      await fileContains('.npmignore', '/test')
      await fileContains('.prettierrc.js', 'semi: false')
      await fileContains('sanity.json', '"path": "./v2-incompatible.js"')
      await fileContains('v2-incompatible.js', 'showIncompatiblePluginDialog')
      await fileContains('tsconfig.json', '"target": "esnext"')

      await fileContains('src/index.ts', `name: '${pluginTestName}'`)

      const pkg: PackageJson = JSON.parse(await readFile(path.join(outputDir, 'package.json')))

      t.has(
        pkg,
        {
          name: pluginTestName,
          version: '1.0.0',
          description: '',
          // author: 'Omitted from validation',
          license: 'MIT',
          source: './src/index.ts',
          main: './lib/cjs/index.js',
          module: './lib/esm/index.js',
          types: './lib/types/index.d.ts',
          exports: {
            '.': {
              require: './lib/cjs/index.js',
              default: './lib/esm/index.js',
            },
          },
          files: ['src', 'lib', 'v2-incompatible.js', 'sanity.json'],
          scripts: {
            clean: 'rimraf lib',
            lint: 'eslint .',
            prebuild: 'npm run clean && plugin-kit verify-package --silent',
            build: 'parcel build --no-cache',
            watch: 'parcel watch',
            'link-watch': 'plugin-kit link-watch',
            prepublishOnly: 'npm run build',
          },
          repository: {
            type: 'git',
            url: 'https://github.com/sanity-io/sanity',
          },
          engines: {
            node: '>=14.0.0',
          },
          bugs: {
            url: 'https://github.com/sanity-io/sanity/issues',
          },
          homepage: 'https://github.com/sanity-io/sanity#readme',
        },
        'package.json has expected content'
      )

      t.strictSame(
        Object.keys(pkg.dependencies ?? {}),
        [incompatiblePluginPackage],
        'should have empty dependencies'
      )
      t.strictSame(
        Object.keys(pkg.peerDependencies ?? {}),
        ['react', 'sanity'],
        'should have expected peerDependencies'
      )

      t.strictSame(
        Object.keys(pkg.devDependencies ?? {}),
        defaultDevDependencies,
        'should have expected devDependencies'
      )
    },
  })
})

tap.test('plugin-kit init --force with all the opt-outs in empty directory', async (t) => {
  await testFixture({
    fixturePath: 'init/empty',
    relativeOutPath: 'opt-out',
    command: ({outputDir}) =>
      runCliCommand('init', [
        outputDir,
        ...initTestArgs.filter((a) => a !== '--license' && a !== 'mit'),
        '--no-install',
        '--no-eslint',
        '--no-prettier',
        '--no-typescript',
        '--no-license',
        '--no-editorconfig',
        '--no-gitignore',
        '--no-scripts',
      ]),
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.equal(stderr, '', 'should have empty stderr')
      t.match(stdout, `Initializing new plugin in "${outputDir}"`)

      const fileContains = fileContainsValidator(t, outputDir)

      const expectNotExist = async (file: string) =>
        t.notOk(await fileExists(path.join(outputDir, normalize(file))), `${file} should not exist`)

      await expectNotExist('LICENSE')
      await expectNotExist('.eslintrc')
      await expectNotExist('.gitignore')
      await expectNotExist('.prettierrc.js')
      await expectNotExist('tsconfig.json')

      await fileContains('src/index.js', `name: '${pluginTestName}'`)

      const pkg: PackageJson = JSON.parse(await readFile(path.join(outputDir, 'package.json')))
      t.same(pkg.scripts, {}, 'scripts should be an empty object')

      t.strictSame(
        Object.keys(pkg.dependencies ?? {}),
        [incompatiblePluginPackage],
        'should have empty dependencies'
      )
      t.strictSame(
        Object.keys(pkg.peerDependencies ?? {}),
        ['react', 'sanity'],
        'should have expected peerDependencies'
      )
      t.strictSame(
        Object.keys(pkg.devDependencies ?? {}),
        ['@sanity/plugin-kit', 'parcel', 'react', 'rimraf', 'sanity'],
        'should have expected devDependencies'
      )
    },
  })
})

tap.test('plugin-kit init --force --ecosystem-preset in empty directory', async (t) => {
  await testFixture({
    fixturePath: 'init/empty',
    relativeOutPath: 'defaults-ecosystem',
    command: ({outputDir}) =>
      runCliCommand('init', [outputDir, ...initTestArgs, '--ecosystem-preset']),
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.equal(stderr, '', 'should have empty stderr')

      const fileContains = fileContainsValidator(t, outputDir)

      await fileContains(path.join('.github', 'workflows', 'main.yml'), 'CI & Release')
      await fileContains(path.join('.husky', 'commit-msg'), 'npx --no -- commitlint')
      await fileContains(path.join('.husky', 'pre-commit'), 'npx lint-staged')
      await fileContains(path.join('.releaserc.json'), '@sanity/semantic-release-preset')
      await fileContains(path.join('commitlint.config.js'), '@commitlint/config-conventional')
      await fileContains(
        path.join('renovate.json'),
        'github>sanity-io/renovate-presets//ecosystem/auto'
      )

      const pkg: PackageJson = JSON.parse(await readFile(path.join(outputDir, 'package.json')))

      t.strictSame(
        Object.keys(pkg.devDependencies ?? {}),
        [
          ...defaultDevDependencies,
          '@commitlint/cli',
          '@commitlint/config-conventional',
          '@sanity/semantic-release-preset',
          'husky',
          'lint-staged',
        ].sort(),
        'should have expected devDependencies'
      )
    },
  })
})
