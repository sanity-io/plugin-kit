import fs from 'fs'
import path from 'path'
import util from 'util'
import pkg from '../../package.json'
import {buildExtensions} from '../configs/buildExtensions'
import {hasSourceFile, hasCompiledFile, readJsonFile, fileExists} from '../util/files'
import {errorToUndefined} from '../util/errorToUndefined'

const stat = util.promisify(fs.stat)
const readFile = util.promisify(fs.readFile)

const allowedPartProps = ['name', 'implements', 'path', 'description']
const disallowedPluginProps = ['api', 'project', 'plugins', 'env']

export interface SanityV2Manifest {
  root?: boolean
  name: string
  paths: ManifestPaths
  parts?: {
    path: string
  }[]
}

export interface ManifestPaths {
  basePath: string
  compiled?: string
  source?: string
}

export interface ManifestOptions {
  isPlugin?: boolean
  validate?: boolean
  pluginName?: string
  basePath: string
  verifySourceParts?: boolean
  verifyCompiledParts?: boolean
  paths?: ManifestPaths
  flags?: Record<string, any>
}

export async function getPaths(options: ManifestOptions) {
  const {basePath} = options
  const manifest = await readManifest(options)
  if (!manifest.paths) {
    return null
  }

  return absolutifyPaths(manifest.paths, basePath)
}

function absolutifyPaths(paths: ManifestPaths | undefined, basePath: string) {
  const getPath = (relative?: string) =>
    relative ? path.resolve(path.join(basePath, relative)) : undefined
  return paths
    ? {
        basePath,
        compiled: getPath(paths.compiled),
        source: getPath(paths.source),
      }
    : {basePath}
}

export async function readManifest(options: ManifestOptions) {
  const {basePath, validate = true} = options
  const manifestPath = path.normalize(path.join(basePath, 'sanity.json'))

  let content
  try {
    content = await readFile(manifestPath, 'utf8')
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `No sanity.json found. sanity.json is required for plugins to function. Use \`${pkg.binname} init\` for a new plugin, or create an empty \`sanity.json\` with an empty object (\`{}\`) for existing ones.`
      )
    }

    throw new Error(`Failed to read "${manifestPath}": ${err.message}`)
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch (err: any) {
    throw new Error(`Error parsing "${manifestPath}": ${err.message}`)
  }

  if (validate) {
    await validateManifest(parsed, options)
  }

  return parsed
}

export async function validateManifest(manifest: SanityV2Manifest, opts: ManifestOptions) {
  const options = {isPlugin: true, ...opts}

  if (!isObject(manifest)) {
    throw new Error(`Invalid sanity.json: Root must be an object`)
  }

  if (options.isPlugin) {
    await validatePluginManifest(manifest, options)
  } else {
    await validateProjectManifest(manifest)
  }

  if ('root' in manifest && typeof manifest.root !== 'boolean') {
    throw new Error(`Invalid sanity.json: "root" property must be a boolean if declared`)
  }

  await validateParts(manifest, {
    ...options,
    paths: absolutifyPaths(manifest.paths, options.basePath),
  })
}

function validateProjectManifest(manifest: SanityV2Manifest) {
  if ('paths' in manifest) {
    throw new Error(`Invalid sanity.json: "paths" property has no meaning in a project manifest`)
  }
}

export async function validatePluginManifest(
  manifest: SanityV2Manifest,
  options: {basePath: string}
) {
  const disallowed = Object.keys(manifest)
    .filter((key) => disallowedPluginProps.includes(key))
    .map((key) => `"${key}"`)

  if (disallowed.length > 0) {
    const plural = disallowed.length > 1 ? 's' : ''
    const joined = disallowed.join(', ')
    throw new Error(
      `Invalid sanity.json: Key${plural} ${joined} ${
        plural ? 'are' : 'is'
      } not allowed in a plugin manifest`
    )
  }

  if (manifest.root) {
    throw new Error(`Invalid sanity.json: "root" cannot be truthy in a plugin manifest`)
  }

  await validatePaths(manifest, options)
}

export async function validatePaths(manifest: SanityV2Manifest, options: {basePath: string}) {
  if (!('paths' in manifest)) {
    return
  }

  if (!isObject(manifest.paths)) {
    throw new Error(`Invalid sanity.json: "paths" must be an object if declared`)
  }

  if (typeof manifest.paths.compiled !== 'string') {
    throw new Error(
      `Invalid sanity.json: "paths" must have a (string) "compiled" property if declared`
    )
  }

  if (typeof manifest.paths.source !== 'string') {
    throw new Error(
      `Invalid sanity.json: "paths" must have a (string) "source" property if declared`
    )
  }

  const sourcePath = path.resolve(options.basePath, manifest.paths.source)
  let srcStats
  try {
    srcStats = await stat(sourcePath)
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(`sanity.json references "source" path which does not exist: "${sourcePath}"`)
    }
  }

  if (!srcStats?.isDirectory()) {
    throw new Error(
      `sanity.json references "source" path which is not a directory: "${sourcePath}"`
    )
  }
}

async function validateParts(manifest: SanityV2Manifest, options: ManifestOptions) {
  if (!('parts' in manifest)) {
    return
  }

  if (!Array.isArray(manifest.parts)) {
    throw new Error(`Invalid sanity.json: "parts" must be an array if declared`)
  }

  let i = 0
  for (const part of manifest.parts) {
    await validatePart(part, i, options)
    i++
  }
}

async function validatePart(part: Record<string, any>, index: number, options: ManifestOptions) {
  if (!isObject(part)) {
    throw new Error(`Invalid sanity.json: "parts[${index}]" must be an object`)
  }

  validateAllowedPartKeys(part, index)
  validatePartStringValues(part, index)
  validatePartNames(part, index, options)
  await validatePartFiles(part, index, options)
}

async function validatePartFiles(
  part: {path?: string} | undefined,
  index: number,
  options: ManifestOptions
) {
  const {verifyCompiledParts, verifySourceParts, paths} = options
  if (!part?.path) {
    return
  }

  const ext = path.extname(part.path)
  if (paths?.source && ext && ext !== '.js' && buildExtensions.includes(ext)) {
    throw new Error(
      `Invalid sanity.json: Part path has extension which is not applicable after compiling. ${ext} becomes .js after compiling. Specify filename without extension (${path.basename(
        part.path
      )}) (parts[${index}])`
    )
  }

  if (!verifySourceParts && !verifyCompiledParts) {
    return
  }

  const [srcExists, libExists] = await Promise.all([
    hasSourceFile(part.path, paths),
    verifyCompiledParts && hasCompiledFile(part.path, paths),
  ])

  if (!srcExists) {
    throw new Error(
      `Invalid sanity.json: Part path references file that does not exist in source directory (${
        paths?.source || paths?.basePath
      }) (parts[${index}])`
    )
  }

  if (verifyCompiledParts && !libExists) {
    throw new Error(
      `Invalid sanity.json: Part path references file ("${part.path}") that does not exist in compiled directory (${paths?.compiled}) (parts[${index}])`
    )
  }
}

function validatePartNames(
  part: {name?: string; implements?: string} | undefined,
  index: number,
  options: ManifestOptions
) {
  const pluginName = options.pluginName ? options.pluginName.replace(/^sanity-plugin-/, '') : ''
  if (!part?.name || !part?.name?.startsWith(`part:${pluginName}/`)) {
    throw new Error(
      `Invalid sanity.json: "name" must be prefixed with "part:${pluginName}/" - got "${part?.name}" (parts[${index}])`
    )
  }

  if (!part?.implements?.startsWith('part:')) {
    throw new Error(
      `Invalid sanity.json: "implements" must be prefixed with "part:" - got "${part?.implements}" (parts[${index}])`
    )
  }
}

function validateAllowedPartKeys(part: Record<string, any>, index: number) {
  const disallowed = Object.keys(part)
    .filter((key) => !allowedPartProps.includes(key))
    .map((key) => `"${key}"`)

  if (disallowed.length > 0) {
    const plural = disallowed.length > 1 ? 's' : ''
    const joined = disallowed.join(', ')
    throw new Error(
      `Invalid sanity.json: Key${plural} ${joined} ${
        plural ? 'are' : 'is'
      } not allowed in a part declaration (parts[${index}])`
    )
  }
}

function validatePartStringValues(part: Record<string, any>, index: number) {
  const nonStrings = Object.keys(part)
    .filter((key) => typeof part[key] !== 'string')
    .map((key) => `"${key}"`)

  if (nonStrings.length > 0) {
    const plural = nonStrings.length > 1 ? 's' : ''
    const joined = nonStrings.join(', ')
    throw new Error(
      `Invalid sanity.json: Key${plural} ${joined} should be of type string (parts[${index}])`
    )
  }
}

function isObject(obj: any) {
  return !Array.isArray(obj) && obj !== null && typeof obj === 'object'
}

export function getReferencesPartPaths(manifest: SanityV2Manifest, basePath: string) {
  const {paths, parts = []} = manifest
  const compiledPath = path.resolve(basePath, paths?.compiled || '')

  return parts
    .filter((part) => part.path)
    .map((part) => part.path)
    .map((partPath) => (path.extname(partPath) === '' ? `${partPath}.js` : partPath))
    .map((partPath) =>
      path.isAbsolute(partPath)
        ? partPath // Not sure if this ever happens, but :shrugs:
        : path.resolve(compiledPath, partPath)
    )
}

export async function hasSanityJson(basePath: string) {
  const file = await readJsonFile<{root?: boolean}>(path.join(basePath, 'sanity.json')).catch(
    errorToUndefined
  )
  return {exists: Boolean(file), isRoot: Boolean(file && file.root)}
}

export async function findStudioV3Config(basePath: string) {
  const jsFile = 'sanity.config.js'
  const jsExists = await fileExists(path.join(basePath, jsFile))
  if (jsExists) {
    return {v3ConfigFile: jsFile}
  }
  const tsFile = 'sanity.config.ts'
  const tsExists = await fileExists(path.join(basePath, tsFile))
  return {v3ConfigFile: tsExists ? tsFile : undefined}
}
