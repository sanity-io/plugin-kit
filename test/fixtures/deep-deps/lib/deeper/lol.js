'use strict'
import someDep from 'some-dep'
import config from 'config:deep-deps'
import otherConfig from 'config:other-module'

Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.lol = lol

var unreffed = require('./unreffed')

function lol() {
  console.log(unreffed)
  someDep()
  return require('yeah-im-a-dep-too')
}
//# sourceMappingURL=lol.js.map
