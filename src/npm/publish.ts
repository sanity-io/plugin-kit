import path from 'path'
// @ts-expect-error missing types
import npmPacklist from 'npm-packlist'

export function getPublishableFiles(basePath: string) {
  return npmPacklist({basePath}).then((files: string[]) =>
    files.map((file) => path.normalize(file)),
  )
}
