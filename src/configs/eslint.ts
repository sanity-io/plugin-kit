import {InjectTemplate} from '../actions/inject'
import {InitFlags} from '../actions/init'

export function eslintrcTemplate(options: {flags: InitFlags}): InjectTemplate {
  const {flags} = options

  const eslintConfig = {
    root: true,
    env: {
      node: true,
      browser: true,
    },
    extends: [
      'sanity',
      flags.typescript && 'sanity/typescript',
      'sanity/react',
      'plugin:react-hooks/recommended',
      flags.prettier && 'plugin:prettier/recommended',
    ].filter(Boolean),
  }

  return {
    type: 'template',
    force: flags.force,
    to: '.eslintrc',
    value: JSON.stringify(eslintConfig, null, 2),
  }
}

export function eslintignoreTemplate(options: {flags: InitFlags; outDir: string}): InjectTemplate {
  const {flags, outDir} = options

  const patterns = [
    '.eslintrc.js',
    'commitlint.config.js',
    outDir,
    'lint-staged.config.js',
    flags.typescript ? 'package.config.ts' : 'package.config.js',
    flags.typescript ? '*.js' : '',
  ].filter(Boolean)

  patterns.sort()

  return {
    type: 'template',
    force: flags.force,
    to: '.eslintignore',
    value: patterns.join('\n'),
  }
}
