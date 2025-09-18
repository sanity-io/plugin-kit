import * as ts from 'typescript'
import path from 'path'
import {fileExists} from './files'

export async function readTSConfig(options: {basePath: string; filename: string}) {
  const {basePath, filename} = options
  const filePath = path.resolve(basePath, filename)
  const exists = await fileExists(filePath)

  if (!exists) return undefined

  return ts.readConfigFile(filePath, ts.sys.readFile).config
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(filePath, ts.sys.readFile).config,
        ts.sys,
        basePath,
      )
    : undefined
}
