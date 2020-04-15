const chalk = require('chalk')

module.exports = {
  msg: (msg, ...args) => console.log(msg, ...args),
  info: (msg, ...args) => console.info(`${chalk.bgBlack.cyanBright('[info]')} ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`${chalk.bgBlack.yellowBright('[warn]')} ${msg}`, ...args),
  error: (msg, ...args) => console.error(`${chalk.bgBlack.redBright('[error]')} ${msg}`, ...args),
}
