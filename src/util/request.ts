import {getIt} from 'get-it'
import {jsonRequest, jsonResponse, httpErrors, headers, promise} from 'get-it/middleware'
import pkg from '../../package.json'

export const request = getIt([
  promise({onlyBody: true}),
  jsonRequest(),
  jsonResponse(),
  httpErrors(),
  headers({'User-Agent': `${pkg.name}@${pkg.version}`}),
])
