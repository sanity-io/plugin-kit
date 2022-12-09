import fs from 'fs'
import path from 'path'
import util from 'util'
import pAny from 'p-any'
import crypto from 'crypto'
import {buildExtensions} from '../configs/buildExtensions'
import {prompt} from './prompt'
import {InitFlags} from '../actions/init'
import log from './log'
import json5 from 'json5'
import {ManifestPaths} from '../sanity/manifest'

export const stat = util.promisify(fs.stat)
export const mkdir = util.promisify(fs.mkdir)
export const readdir = util.promisify(fs.readdir)
export const copyFile = util.promisify(fs.copyFile)
export const readFile = util.promisify(fs.readFile)
export const writeFile = util.promisify(fs.writeFile)

export function hasSourceEquivalent(compiledFile: string, paths: ManifestPaths) {
  if (!paths.source) {
    return fileExists(
      path.isAbsolute(compiledFile) ? compiledFile : path.resolve(paths.basePath, compiledFile)
    )
  }

  // /plugin/lib/MyComponent.js => /plugin/src
  const baseDir = path.dirname(compiledFile.replace(paths.compiled as string, paths.source))

  // /plugin/lib/MyComponent.js => MyComponent
  const baseName = path.basename(compiledFile, path.extname(compiledFile))

  // MyComponent => /plugin/src/MyComponent
  const pathStub = path.join(baseDir, baseName)

  /*
   * /plugin/src/MyComponent => [
   *   /plugin/src/MyComponent.jsx,
   *   /plugin/src/MyComponent.mjs,
   *   ...
   * ]
   */
  return buildCandidateExists(pathStub)
}

// Generally used for parts resolving
export async function hasSourceFile(filePath: string, paths?: ManifestPaths) {
  if (!paths?.source) {
    return fileExists(
      path.isAbsolute(filePath) ? filePath : path.resolve(paths?.basePath ?? '', filePath)
    )
  }

  // filePath: components/SomeInput
  // paths: {source: '/plugin/src'}
  // MyComponent => /plugin/src/MyComponent
  const pathStub = path.isAbsolute(filePath) ? filePath : path.resolve(paths.source, filePath)

  if (await fileExists(pathStub)) {
    return true
  }

  return buildCandidateExists(pathStub)
}

// Generally used for parts resolving
export function hasCompiledFile(filePath: string, paths?: ManifestPaths) {
  if (!paths?.compiled) {
    return fileExists(
      path.isAbsolute(filePath) ? filePath : path.resolve(paths?.basePath ?? '', filePath)
    )
  }

  // filePath: components/SomeInput
  // paths: {compiled: '/plugin/lib'}

  // components/SomeInput => /plugin/lib/components/SomeInput
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(paths.compiled, filePath)

  // /plugin/lib/components/SomeInput     => /plugin/lib/components/SomeInput.js
  // /plugin/lib/components/SomeInput.js  => /plugin/lib/components/SomeInput.js
  // /plugin/lib/components/SomeInput.css => /plugin/lib/components/SomeInput.css
  const fileExt = path.extname(absPath)
  const withExt = fileExt === '' ? `${absPath}.js` : absPath

  return fileExists(withExt)
}

export function buildCandidateExists(pathStub: string) {
  const candidates = buildExtensions.map((extCandidate) => `${pathStub}${extCandidate}`)

  return pAny(candidates.map((candidate) => stat(candidate)))
    .then(() => true)
    .catch(() => false)
}

export function fileExists(filePath: string) {
  return stat(filePath)
    .then(() => true)
    .catch(() => false)
}

export async function readJsonFile<T>(filePath: string) {
  const content = await readFile(filePath, 'utf8')
  return JSON.parse(content) as T
}

export function writeJsonFile(filePath: string, content: Record<string, unknown>) {
  const data = JSON.stringify(content, null, 2) + '\n'
  return writeFile(filePath, data, {encoding: 'utf8'})
}

export async function writeFileWithOverwritePrompt(
  filePath: string,
  content: string,
  options: {default?: any; force?: boolean} & fs.ObjectEncodingOptions
) {
  const {default: defaultVal, force = false, ...writeOptions} = options
  const withinCwd = filePath.startsWith(process.cwd())
  const printablePath = withinCwd ? path.relative(process.cwd(), filePath) : filePath

  if (await fileEqualsData(filePath, content)) {
    return false
  }

  if (
    !force &&
    (await fileExists(filePath)) &&
    !(await prompt(`File "${printablePath}" already exists. Overwrite?`, {
      type: 'confirm',
      default: defaultVal,
    }))
  ) {
    return false
  }

  await writeFile(filePath, content, writeOptions)
  return true
}

export async function copyFileWithOverwritePrompt(from: string, to: string, flags: InitFlags) {
  const withinCwd = to.startsWith(process.cwd())
  const printablePath = withinCwd ? path.relative(process.cwd(), to) : to

  if (await filesAreEqual(from, to)) {
    return false
  }

  await ensureDirectoryExists(to)

  if (
    !flags.force &&
    (await fileExists(to)) &&
    !(await prompt(`File "${printablePath}" already exists. Overwrite?`, {
      type: 'confirm',
      default: false,
    }))
  ) {
    return false
  }

  await copyFile(from, to)
  return true
}

async function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath)
  if (await fileExists(dirname)) {
    return true
  }
  await ensureDirectoryExists(dirname)
  await mkdir(dirname)
}

export async function fileEqualsData(filePath: string, content: string) {
  const contentHash = crypto.createHash('sha1').update(content).digest('hex')
  const remoteHash = await getFileHash(filePath)
  return contentHash === remoteHash
}

export async function filesAreEqual(file1: string, file2: string) {
  const [hash1, hash2] = await Promise.all([getFileHash(file1, false), getFileHash(file2)])
  return hash1 === hash2
}

export function getFileHash(filePath: string, allowMissing = true) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1')
    const stream = fs.createReadStream(filePath)
    stream.on('error', (err) => {
      if ((err as unknown as {code?: string}).code === 'ENOENT' && allowMissing) {
        resolve(null)
      } else {
        reject(err)
      }
    })

    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('data', (chunk) => hash.update(chunk))
  })
}

export async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath)
  } catch (err) {
    if ((err as unknown as {code?: string}).code !== 'EEXIST') {
      throw err
    }
  }
}

export async function isEmptyish(dirPath: string) {
  const ignoredFiles = ['.git', '.gitignore', 'license', 'readme.md']
  const allFiles = await readdir(dirPath).catch(() => [])
  const files = allFiles.filter((file) => !ignoredFiles.includes(file.toLowerCase()))
  return files.length === 0
}

export async function readFileContent({
  filename,
  basePath,
}: {
  filename: string
  basePath: string
}): Promise<string | undefined> {
  const filepath = path.normalize(path.join(basePath, filename))
  try {
    return await readFile(filepath, 'utf8')
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      log.debug(`No ${filename} file found.`)
      return undefined
    }
    throw new Error(`Failed to read "${filepath}": ${err.message}`)
  }
}

export async function readJson5File<T>({
  filename,
  basePath,
}: {
  filename: string
  basePath: string
}): Promise<T | undefined> {
  const content = await readFileContent({filename, basePath})
  if (!content) {
    return undefined
  }

  return parseJson5<T>(content, filename)
}

export function parseJson5<T>(content: string, errorKey: string): T {
  try {
    return json5.parse<T>(content)
  } catch (err: any) {
    throw new Error(`Error parsing "${errorKey}": ${err.message}`)
  }
}
