/*
import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import {discoverPathSync} from 'discover-path'
import traverse from '@babel/traverse'
import {parseSync} from '@babel/core'

export default {findDependencies}

const partReg = /^(all:part|part|config|sanity):/
const importReg = /^(?:"([^"]+)"|'([^']+)')$/
const composesReg = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)'|(global))$/

function findDependenciesFromFiles(files, seen = new Set<string>()): string[] {
  const dependencies = new Set<string>()
  files.forEach((file) => findDependencies(file, seen).forEach((dep) => dependencies.add(dep)))
  return Array.from(dependencies)
}

function findDependenciesInCss(css, entryPath, processDependency) {
  let ast
  try {
    ast = postcss.parse(css)
  } catch (err: any) {
    throw new Error(`Error parsing file (${entryPath}): ${err.message}`)
  }

  ast.walkDecls(/^composes/, (decl) => {
    const matches = decl.value.match(composesReg)
    if (!matches) {
      return
    }

    const [, , doubleQuotePath, singleQuotePath] = matches
    const importPath = doubleQuotePath || singleQuotePath
    if (importPath) {
      processDependency(importPath)
    }
  })

  ast.walkAtRules('import', (rule) => {
    const matches = rule.params.match(importReg)
    if (!matches) {
      return
    }

    const [, doubleQuotePath, singleQuotePath] = matches
    const importPath = doubleQuotePath || singleQuotePath
    if (importPath) {
      processDependency(importPath)
    }
  })
}

interface Traverse {
  node: {callee: {name: string}; source: {value: string}; arguments: {value: string}[]}
}

function findDependenciesInJs(
  js: string,
  entryPath: string,
  processDependency: (val: string) => void
) {
  let ast
  try {
    ast = parseSync(js, {babelrc: false})
  } catch (err: any) {
    throw new Error(`Error parsing file (${entryPath}): ${err.message}`)
  }

  traverse(ast, {
    ImportDeclaration({node}: Traverse) {
      processDependency(node.source.value)
    },

    CallExpression({node}: Traverse) {
      if (node.callee.name === 'require') {
        processDependency(node.arguments[0].value)
      }
    },
  })
}

export function findDependencies(entryPath: string, seen = new Set<string>()): string[] {
  if (Array.isArray(entryPath)) {
    return findDependenciesFromFiles(entryPath, seen)
  }

  seen.add(entryPath)

  let content
  try {
    content = fs.readFileSync(entryPath, 'utf8')
  } catch (err: any) {
    throw new Error(`Error reading file (${entryPath}): ${err.message}`)
  }

  const dir = path.dirname(entryPath)
  const dependencies = new Set<string>()

  if (entryPath.endsWith('.css')) {
    findDependenciesInCss(content, entryPath, processDependency)
  } else {
    findDependenciesInJs(content, entryPath, processDependency)
  }

  function processDependency(requirePath: string) {
    if (typeof requirePath !== 'string') {
      return
    }

    // Don't allow absolute requires
    if (path.isAbsolute(requirePath)) {
      throw new Error(
        `Absolute paths cannot be used in require/import statements: ${entryPath} references path "${requirePath}"`
      )
    }

    const isRelative = requirePath.startsWith('.')
    const depPath = isRelative && resolveDependency(dir, requirePath, entryPath)

    if (
      depPath &&
      ['.js', '.css', '.esm', '.mjs', '.jsx'].includes(path.extname(depPath)) &&
      !seen.has(depPath)
    ) {
      // For relative javascript/css requires, recurse to find all depdendencies
      findDependencies(depPath, seen).forEach((dep) => dependencies.add(dep))
      return
    }

    if (isRelative) {
      // Not JS? Skip it
      return
    }

    // For parts, we want the entire path, as we might want to validate them
    if (partReg.test(requirePath)) {
      dependencies.add(requirePath)
      return
    }

    // For modules, resolve the base module name, then add them
    // eg: `codemirror/mode/javascript` => `codemirror`
    // eg: `@sanity/base/foo/bar.js`    => `@sanity/base`
    const dep = requirePath.startsWith('@')
      ? requirePath.replace(/^(@[^/]+\/[^/]+)(\/.*|$)/, '$1')
      : requirePath.replace(/^([^/]+)(\/.*|$)/, '$1')

    dependencies.add(dep)
  }

  return Array.from(dependencies)
}

function resolveDependency(fromDir: string, toPath: string, entryPath: string) {
  const [querylessPath] = toPath.split('?', 1)

  let depPath
  try {
    depPath = require.resolve(path.resolve(fromDir, querylessPath))
  } catch (err) {
    throw new Error(`Unable to resolve "${querylessPath}" from ${entryPath}`)
  }

  let actualPath
  try {
    actualPath = discoverPathSync(depPath)
  } catch (err: any) {
    const paths = (err.suggestions || []).map((suggested: string) =>
      getDidYouMeanPath(querylessPath, suggested)
    )
    const didYouMean = paths ? `Did you mean:\n${paths.join('\n- ')}` : ''
    throw new Error(`Unable to resolve "${querylessPath}" from ${entryPath}. ${didYouMean}`)
  }

  if (actualPath !== depPath) {
    const didYouMean = getDidYouMeanPath(querylessPath, actualPath)
    throw new Error(
      `Unable to resolve "${querylessPath} from ${entryPath}. Did you mean "${didYouMean}"?`
    )
  }

  return actualPath
}

function getDidYouMeanPath(wanted: string, suggested: string) {
  const end = wanted.replace(/[./]+/, '')
  const start = wanted.slice(0, 0 - end.length)
  return `${start}${suggested.slice(0 - end.length)}`
}
*/
