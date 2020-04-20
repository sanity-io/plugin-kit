const path = require('path')
const outdent = require('outdent')
const splat = require('./splat')
const log = require('../util/log')
const {fileExists, writeFile, writeJsonFile, ensureDir} = require('../util/files')
const {resolveLatestVersions} = require('../npm/resolveLatestVersions')

const defaultDependencies = ['prop-types']
const defaultDevDependencies = {}
const defaultPeerDependencies = {react: '^16.2.0'}

const defaultSanityManifest = {
  paths: {
    source: './src',
    compiled: './lib',
  },
  parts: [],
}

const defaultSource = outdent`
  import React from 'react'
  import PropTypes from 'prop-types'

  const MyPlugin = (props) => {
    return <div>This is a {props.thing}!</div>
  }

  MyPlugin.propTypes = {
    thing: PropTypes.string,
  }

  MyPlugin.defaultProps = {
    thing: 'plugin',
  }

  export default MyPlugin
`.trimStart()

module.exports = async function init(options) {
  const manifestPath = path.join(options.basePath, 'sanity.json')

  let dependencies = {}
  let devDependencies = {}
  let peerDependencies = {}

  const hadSanityJson = await fileExists(manifestPath)
  if (!hadSanityJson) {
    // If we're initializing into a new directory (with no `sanity.json`),
    // we'll be writing some sample source code which depends on React.
    // We should help out by adding dependencies!
    dependencies = {...dependencies, ...(await resolveLatestVersions(defaultDependencies))}
    devDependencies = {...devDependencies, ...defaultDevDependencies}
    peerDependencies = {...peerDependencies, ...defaultPeerDependencies}

    await writeJsonFile(manifestPath, defaultSanityManifest)
    log.info('Wrote sanity.json')
  }

  await splat({
    ...options,
    requireUserConfirmation: true,
    dependencies,
    devDependencies,
    peerDependencies,
    validate: false,
  })

  if (!hadSanityJson) {
    const srcDir = path.resolve(options.basePath, defaultSanityManifest.paths.source)
    await ensureDir(srcDir)
    await writeFile(path.join(srcDir, 'YourPlugin.js'), defaultSource, {encoding: 'utf8'})
  }
}
