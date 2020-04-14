const npmPacklist = require('npm-packlist')

module.exports = {getPublishableFiles}

function getPublishableFiles(path) {
  return npmPacklist({path})
}
