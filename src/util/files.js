const fs = require('fs')
const path = require('path')
const util = require('util')
const pAny = require('p-any')
const crypto = require('crypto')
const {buildExtensions} = require('../configs/buildExtensions')
const {uselessFiles} = require('../configs/uselessFiles')
const {prompt} = require('./prompt')

const stat = util.promisify(fs.stat)
const mkdir = util.promisify(fs.mkdir)
const readdir = util.promisify(fs.readdir)
const copyFile = util.promisify(fs.copyFile)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

module.exports = {
  copyFile,
  ensureDir,
  hasSourceEquivalent,
  hasSourceFile,
  hasCompiledFile,
  fileExists,
  readFile,
  readJsonFile,
  writeFile,
  writeJsonFile,
  uselessFiles,
  copyFileWithOverwritePrompt,
  writeFileWithOverwritePrompt,
  isEmptyish,
}

function hasSourceEquivalent(compiledFile, paths) {
  if (!paths.source) {
    return fileExists(
      path.isAbsolute(compiledFile) ? compiledFile : path.resolve(paths.basePath, compiledFile)
    )
  }

  // /plugin/lib/MyComponent.js => /plugin/src
  const baseDir = path.dirname(compiledFile.replace(paths.compiled, paths.source))

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
async function hasSourceFile(filePath, paths) {
  if (!paths.source) {
    return fileExists(path.isAbsolute(filePath) ? filePath : path.resolve(paths.basePath, filePath))
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
function hasCompiledFile(filePath, paths) {
  if (!paths.compiled) {
    return fileExists(path.isAbsolute(filePath) ? filePath : path.resolve(paths.basePath, filePath))
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

function buildCandidateExists(pathStub) {
  const candidates = buildExtensions.map((extCandidate) => `${pathStub}${extCandidate}`)

  return pAny(candidates.map((candidate) => stat(candidate)))
    .then(() => true)
    .catch(() => false)
}

function fileExists(filePath) {
  return stat(filePath)
    .then(() => true)
    .catch(() => false)
}

async function readJsonFile(filePath) {
  const content = await readFile(filePath, 'utf8')
  return JSON.parse(content)
}

function writeJsonFile(filePath, content) {
  const data = JSON.stringify(content, null, 2)
  return writeFile(filePath, data, {encoding: 'utf8'})
}

async function writeFileWithOverwritePrompt(filePath, content, options) {
  const {default: defaultVal, ...writeOptions} = options
  const withinCwd = filePath.startsWith(process.cwd())
  const printablePath = withinCwd ? path.relative(process.cwd(), filePath) : filePath

  if (await fileEqualsData(filePath, content)) {
    return false
  }

  if (
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

async function copyFileWithOverwritePrompt(from, to) {
  const withinCwd = to.startsWith(process.cwd())
  const printablePath = withinCwd ? path.relative(process.cwd(), to) : to

  if (await filesAreEqual(from, to)) {
    return false
  }

  if (
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

async function fileEqualsData(filePath, content) {
  const contentHash = crypto.createHash('sha1').update(content).digest('hex')
  const remoteHash = await getFileHash(filePath)
  return contentHash === remoteHash
}

async function filesAreEqual(file1, file2) {
  const [hash1, hash2] = await Promise.all([getFileHash(file1, false), getFileHash(file2)])
  return hash1 === hash2
}

function getFileHash(filePath, allowMissing = true) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1')
    const stream = fs.createReadStream(filePath)
    stream.on('error', (err) => {
      if (err.code === 'ENOENT' && allowMissing) {
        resolve(null)
      } else {
        reject(err)
      }
    })

    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('data', (chunk) => hash.update(chunk))
  })
}

async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
}

async function isEmptyish(dirPath) {
  const ignoredFiles = ['.git', '.gitignore', 'license', 'readme.md']
  const allFiles = await readdir(dirPath).catch(() => [])
  const files = allFiles.filter((file) => !ignoredFiles.includes(file.toLowerCase()))
  return files.length === 0
}
