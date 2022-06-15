// Note: This is _specifically_ meant for CLI usage,
// I realize that "singletons" are bad.

import chalk from 'chalk'

let beQuiet = false
let beVerbose = false

function setVerbosity({verbose, silent}: {verbose: boolean; silent: boolean}) {
  if (silent) {
    beVerbose = false
    beQuiet = true
  } else if (verbose) {
    beVerbose = true
    beQuiet = false
  }
}

export default {
  setVerbosity: setVerbosity,

  // Bypasses any checks, prints regardless (only use for things like `cli --version`)
  msg: (msg: any, ...args: any[]) => !beQuiet && console.log(msg, ...args),

  // Debug only printed on --verbose
  debug: (msg: any, ...args: any[]) =>
    !beQuiet && beVerbose && console.debug(`${chalk.bgBlack.white('[debug]')} ${msg}`, ...args),

  // Success messages only printed if not --silent
  success: (msg: any, ...args: any[]) =>
    !beQuiet && console.info(`${chalk.bgBlack.greenBright('[success]')} ${msg}`, ...args),

  // Info only printed if not --silent ("standard" level)
  info: (msg: any, ...args: any[]) =>
    !beQuiet && console.info(`${chalk.bgBlack.cyanBright('[info]')} ${msg}`, ...args),

  // Warning only printed if not --silent
  warn: (msg: any, ...args: any[]) =>
    !beQuiet && console.warn(`${chalk.bgBlack.yellowBright('[warn]')} ${msg}`, ...args),

  // Errors are always printed
  error: (msg: any, ...args: any[]) =>
    console.error(`${chalk.bgBlack.redBright('[error]')} ${msg}`, ...args),
}
