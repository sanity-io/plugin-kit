// Note: This is _specifically_ meant for CLI usage,
// I realize that "singletons" are bad.

const chalk = require('chalk')

let beQuiet = false
let beVerbose = false

function setVerbosity({verbose, silent}) {
  if (silent) {
    beVerbose = false
    beQuiet = true
  } else if (verbose) {
    beVerbose = true
    beQuiet = false
  }
}

module.exports = {
  setVerbosity: setVerbosity,

  // Bypasses any checks, prints regardless (only use for things like `cli --version`)
  msg: (msg, ...args) => !beQuiet && console.log(msg, ...args),

  // Debug only printed on --verbose
  debug: (msg, ...args) =>
    !beQuiet && beVerbose && console.debug(`${chalk.bgBlack.white('[debug]')} ${msg}`, ...args),

  // Success messages only printed if not --silent
  success: (msg, ...args) =>
    !beQuiet && console.info(`${chalk.bgBlack.greenBright('[success]')} ${msg}`, ...args),

  // Info only printed if not --silent ("standard" level)
  info: (msg, ...args) =>
    !beQuiet && console.info(`${chalk.bgBlack.cyanBright('[info]')} ${msg}`, ...args),

  // Warning only printed if not --silent
  warn: (msg, ...args) =>
    !beQuiet && console.warn(`${chalk.bgBlack.yellowBright('[warn]')} ${msg}`, ...args),

  // Errors are always printed
  error: (msg, ...args) => console.error(`${chalk.bgBlack.redBright('[error]')} ${msg}`, ...args),
}
