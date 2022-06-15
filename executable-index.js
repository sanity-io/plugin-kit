const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')

const filePath = pkg.main
const entryPoint = path.resolve(__dirname, filePath)
console.log('Making ' + filePath + ' executable.')
fs.chmodSync(entryPoint, '755')
