import {InjectTemplate} from '../actions/inject'

export function prettierignoreTemplate(options: {outDir: string}): InjectTemplate {
  const {outDir} = options

  return {
    type: 'template',
    to: '.prettierignore',
    value: [outDir, 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json'].join('\n'),
  }
}
