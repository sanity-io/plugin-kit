const fs = require('fs')
const path = require('path')
const util = require('util')
const pAny = require('p-any')
const {buildExtensions} = require('../configs/buildExtensions')
const {uselessFiles} = require('../configs/uselessFiles')

const stat = util.promisify(fs.stat)

module.exports = {hasSourceEquivalent, hasSourceFile, hasCompiledFile, fileExists, uselessFiles}

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
function hasSourceFile(filePath, paths) {
  if (!paths.source) {
    return fileExists(path.isAbsolute(filePath) ? filePath : path.resolve(paths.basePath, filePath))
  }

  // filePath: components/SomeInput
  // paths: {source: '/plugin/src'}

  // components/SomeInput.tsx => .tsx
  const ext = path.extname(filePath)
  if (ext) {
    // If we already have an extension, we don't need to mess around with trying alternatives
    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(paths.source, filePath)
    return fileExists(absPath)
  }

  // MyComponent => /plugin/src/MyComponent
  const pathStub = path.isAbsolute(filePath) ? filePath : path.resolve(paths.source, filePath)

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

  // /plugin/lib/components/SomeInput    => /plugin/lib/components/SomeInput.js
  // /plugin/lib/components/SomeInput.js => /plugin/lib/components/SomeInput.js

  const withExt = absPath.endsWith('.js') ? absPath : `${absPath}.js`
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
