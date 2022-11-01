import log from '../../util/log'
import {TypedFlags} from 'meow'
import fs from 'fs'
import sharedFlags from '../../sharedFlags'
import {TsConfig} from './types'
import chalk from 'chalk'
import outdent from 'outdent'
import {runCommand} from '../../util/command-parser'

export const readFile = fs.promises.readFile
const splitLine = `\n----------------------------------------------------------`

export const verifyPackageConfigDefaults = {
  packageName: true,
  module: true,
  tsconfig: true,
  tsc: true,
  dependencies: true,
  babelConfig: true,
  sanityV2Json: true,
  eslintImports: true,
  scripts: true,
  'pkg-utils': true,
  nodeEngine: true,
  studioConfig: true,
} as const

export type VerifyPackageConfig = Partial<Record<keyof typeof verifyPackageConfigDefaults, boolean>>

export const verifyFlags = {
  ...sharedFlags,
  single: {
    default: false,
    type: 'boolean',
  },
} as const

export type VerifyFlags = TypedFlags<typeof verifyFlags>

export function disableCheckText(checkKey: string) {
  return chalk.grey(
    outdent`
              To skip this validation add the following to your package.json:
              "sanityPlugin": {
                 "verifyPackage": {
                    "${checkKey}": false
                 }
              }
          `.trimStart()
  )
}

export function createValidator(
  verifyConfig: VerifyPackageConfig,
  flags: VerifyFlags,
  errors: string[]
) {
  return async function validation(
    checkKey: keyof VerifyPackageConfig,
    task: () => Promise<string[] | undefined>
  ) {
    if (verifyConfig[checkKey] !== false) {
      const result = await task()
      if (result?.length) {
        result.push(disableCheckText(checkKey))
        const errorMessage = result.join('\n\n')
        errors.push(errorMessage)
        log.error(`\n` + errorMessage + splitLine)
      }
    }

    if (flags.single && errors.length) {
      throw new Error(
        outdent`Detected outstanding upgrade issues.

        Fail-fast (--single) mode enabled, stopping validation here.
        `
      )
    }
  }
}

export async function runTscMaybe(verifyConfig: VerifyPackageConfig, tsConfig?: TsConfig) {
  if (tsConfig && verifyConfig.tsc !== false) {
    log.info('All checks ok, running Typescript compiler.')
    const {code} = await runCommand('tsc --noEmit')
    if (code !== 0) {
      throw new Error('Compilation failed. See output above.\n\n' + disableCheckText('tsc'))
    }
  }
}
