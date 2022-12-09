import {getPackage} from '../npm/package'
import log from '../util/log'
import {cliName, urls} from '../constants'
import {validateImports} from '../dependencies/import-linter'
import outdent from 'outdent'
import chalk from 'chalk'
import {
  createValidator,
  runTscMaybe,
  VerifyFlags,
  VerifyPackageConfig,
} from './verify/verify-common'
import {PackageJson} from './verify/types'
import {validateSanityDependencies, validateStudioConfig} from './verify/validations'
import {readTSConfig} from '../util/ts'

export async function verifyStudio({basePath, flags}: {basePath: string; flags: VerifyFlags}) {
  let errors: string[] = []

  const packageJson: PackageJson = await getPackage({basePath, validate: false})
  const verifyConfig: VerifyPackageConfig = packageJson.sanityPlugin?.verifyPackage || {}

  const validation = createValidator(verifyConfig, flags, errors)

  const ts = await readTSConfig({basePath, filename: 'tsconfig.json'})

  await validation('studioConfig', async () => validateStudioConfig({basePath}))
  await validation('dependencies', async () => validateSanityDependencies(packageJson))
  await validation('eslintImports', async () => validateImports({basePath}))

  if (errors.length) {
    throw new Error(
      outdent`
        Detected validation issues!
        This Sanity Studio is not completely V3 ready. Fix the issues starting from the top, or disable any checks you deem unnecessary.

        More information is available here:
        - Migration guide: ${urls.migrationGuideStudio}
        - Reference documentation: ${urls.refDocs}

        ${chalk.grey(
          `To fail-fast on first detected issue run:\nnpx ${cliName} verify-studio --single`
        )}
      `.trimStart()
    )
  }

  await runTscMaybe(verifyConfig, ts)

  log.success(
    outdent`
    No outstanding upgrade issues detected. Studio is V3 ready!
  `.trim()
  )
}
