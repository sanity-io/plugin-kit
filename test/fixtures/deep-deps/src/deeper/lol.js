const unreffed = require('./unreffed')

export function lol() {
  console.log(unreffed)
  return require('yeah-im-a-dep-too')
}
