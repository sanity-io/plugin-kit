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
  '@sanity/pkg-utils',
  '@sanity/plugin-kit',
  '@types/react',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint',
  'eslint-config-prettier',
  'eslint-config-sanity',
  'eslint-plugin-prettier',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'npm-run-all',
  'prettier',
  'prettier-plugin-packagejson',
  'react',
  'react-dom',
  'react-is',
  'rimraf',
  'sanity',
  'styled-components',
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
      await fileContains('.gitignore', 'dist')
      await fileContains(
        '.eslintrc',
        'sanity',
        'sanity/typescript',
        'sanity/react',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended',
      )
      await fileContains(
        '.eslintignore',
        '.eslintrc.js',
        'commitlint.config.js',
        'dist',
        'lint-staged.config.js',
        '*.js',
      )
      await fileContains('.prettierrc', '"semi": false')
      await fileContains('sanity.json', '"path": "./v2-incompatible.js"')
      await fileContains('v2-incompatible.js', 'showIncompatiblePluginDialog')
      await fileContains('tsconfig.json', '"extends": "./tsconfig.settings"')
      await fileContains('tsconfig.dist.json', '"extends": "./tsconfig.settings"')
      await fileContains('tsconfig.settings.json', '"target": "esnext"')

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
          exports: {
            '.': {
              types: './dist/index.d.ts',
              source: './src/index.ts',
              import: './dist/index.esm.js',
              require: './dist/index.js',
              default: './dist/index.esm.js',
            },
          },
          main: './dist/index.js',
          module: './dist/index.esm.js',
          types: './dist/index.d.ts',
          files: ['dist', 'sanity.json', 'src', 'v2-incompatible.js'],
          scripts: {
            clean: 'rimraf dist',
            lint: 'eslint .',
            build:
              'run-s clean && plugin-kit verify-package --silent && pkg-utils build --strict && pkg-utils --strict',
            watch: 'pkg-utils watch --strict',
            'link-watch': 'plugin-kit link-watch',
            prepublishOnly: 'run-s build',
          },
          repository: {
            type: 'git',
            url: 'https://github.com/sanity-io/sanity',
          },
          engines: {
            node: '>=18',
          },
          bugs: {
            url: 'https://github.com/sanity-io/sanity/issues',
          },
          homepage: 'https://github.com/sanity-io/sanity#readme',
        },
        'package.json has expected content',
      )

      t.strictSame(
        Object.keys(pkg.dependencies ?? {}),
        [incompatiblePluginPackage],
        'should have empty dependencies',
      )
      t.strictSame(
        Object.keys(pkg.peerDependencies ?? {}),
        ['react', 'sanity'],
        'should have expected peerDependencies',
      )

      t.strictSame(
        Object.keys(pkg.devDependencies ?? {}),
        defaultDevDependencies,
        'should have expected devDependencies',
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
      await expectNotExist('.prettierrc')
      await expectNotExist('tsconfig.json')

      await fileContains('src/index.js', `name: '${pluginTestName}'`)

      const pkg: PackageJson = JSON.parse(await readFile(path.join(outputDir, 'package.json')))
      t.same(pkg.scripts, {}, 'scripts should be an empty object')

      t.strictSame(
        Object.keys(pkg.dependencies ?? {}),
        [incompatiblePluginPackage],
        'should have empty dependencies',
      )
      t.strictSame(
        Object.keys(pkg.peerDependencies ?? {}),
        ['react', 'sanity'],
        'should have expected peerDependencies',
      )
      t.strictSame(
        Object.keys(pkg.devDependencies ?? {}),
        [
          '@sanity/pkg-utils',
          '@sanity/plugin-kit',
          'npm-run-all',
          'react',
          'react-dom',
          'react-is',
          'rimraf',
          'sanity',
          'styled-components',
        ],
        'should have expected devDependencies',
      )
    },
  })
})

tap.test('plugin-kit init --force --preset semver-workflow in empty directory', async (t) => {
  await testFixture({
    fixturePath: 'init/empty',
    relativeOutPath: 'defaults-semver-workflow',
    command: ({outputDir}) =>
      runCliCommand('init', [outputDir, ...initTestArgs, '--preset', 'semver-workflow']),
    assert: async ({result: {stdout, stderr}, outputDir}) => {
      t.equal(stderr, '', 'should have empty stderr')

      const fileContains = fileContainsValidator(t, outputDir)

      await fileContains(path.join('.github', 'workflows', 'main.yml'), 'CI & Release')
      await fileContains(path.join('.husky', 'commit-msg'), 'npx --no -- commitlint')
      await fileContains(path.join('.husky', 'pre-commit'), 'npx lint-staged')
      await fileContains(path.join('.releaserc.json'), '@sanity/semantic-release-preset')
      await fileContains(path.join('commitlint.config.js'), '@commitlint/config-conventional')

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
        'should have expected devDependencies',
      )

      t.strictSame(pkg.scripts?.prepare, 'husky install')
    },
  })
})
