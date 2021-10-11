const path = require('path')
const npmPacklist = require('npm-packlist')

module.exports = {getPublishableFiles}

function getPublishableFiles(basePath) {
  return npmPacklist({basePath}).then(files => files.map(file => path.normalize(file)))
}
