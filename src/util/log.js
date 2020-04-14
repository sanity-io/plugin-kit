const chalk = require('chalk')

module.exports = {
  warn: (msg) => console.warn(`${chalk.bgBlack.yellowBright('[warn ]')} ${msg}`),
  error: (msg) => console.warn(`${chalk.bgBlack.redBright('[error]')} ${msg}`),
}
