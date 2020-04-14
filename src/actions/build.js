const path = require('path')
const childProcess = require('child_process')
const npmRunPath = require('npm-run-path')
const findBabelConfig = require('find-babel-config')
const {getPaths} = require('../sanity/manifest')
const {getPackage} = require('../npm/package')
const {buildExtensions} = require('../configs/buildExtensions')

const defaultBabelConfigPath = path.join(__dirname, '..', 'configs', 'babelrc.js')

module.exports = async function build({basePath, flags}) {
  const pkg = await getPackage({basePath, flags})
  const paths = await getPaths({basePath, pluginName: pkg.name, flags})
  if (!paths) {
    console.warn(`No "paths" property declared in sanity.json, will not compile with babel`)
    return
  }

  const babelConfig = await findBabelConfig(basePath)
  const configPath = babelConfig.file || defaultBabelConfigPath

  console.log('Compiling source with babel')
  await spawn(
    'babel',
    [
      // Booleans
      '--copy-files',
      '--delete-dir-on-start',

      // Babel configuration
      '--config-file',
      configPath,

      // Compile JSX, typescript as well
      '--extensions',
      buildExtensions.join(','),

      // Where to actually output the stuff
      '--out-dir',
      paths.compiled,

      // Where to read source from
      paths.source,
    ],
    {
      env: npmRunPath.env(),
      stdio: 'inherit',
    }
  )
}

function spawn(cmd, args, options) {
  return new Promise((resolve, reject) => {
    childProcess.spawn(cmd, args, options).on('error', reject).on('close', resolve)
  })
}
