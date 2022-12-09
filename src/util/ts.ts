import {loadTSConfig} from '@sanity/pkg-utils'
import path from 'path'
import {fileExists} from './files'

export async function readTSConfig(options: {basePath: string; filename: string}) {
  const {basePath, filename} = options
  const filePath = path.resolve(basePath, filename)
  const exists = await fileExists(filePath)

  if (!exists) return undefined

  return await loadTSConfig({cwd: basePath, tsconfigPath: filename})
}
