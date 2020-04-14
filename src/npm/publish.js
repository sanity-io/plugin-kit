const npmPacklist = require('npm-packlist')

module.exports = {getStagedFiles}

function getStagedFiles(path) {
  return npmPacklist({path})
}
