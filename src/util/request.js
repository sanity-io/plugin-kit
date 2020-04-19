const getIt = require('get-it')
const {jsonRequest, jsonResponse, httpErrors, headers, promise} = require('get-it/middleware')
const pkg = require('../../package.json')

const request = getIt([
  promise({onlyBody: true}),
  jsonRequest(),
  jsonResponse(),
  httpErrors(),
  headers({'User-Agent': `${pkg.name}@${pkg.version}`}),
])

module.exports = {request}
