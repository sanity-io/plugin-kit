import childProcess from 'child_process'
import npmRunPath from 'npm-run-path'
import log from './log'

interface Command {
  command: string
  args: string[]
}

export function parseCommand(commandString: string): Command {
  const normalized = commandString.replace(/ +/g, ' ')
  const commandAndArg = normalized.split(' ')
  return {
    command: commandAndArg[0],
    args: commandAndArg.length > 1 ? commandAndArg.slice(1) : [],
  }
}

export async function runCommand(commandString: string): Promise<{code: number}> {
  log.info(`Running command: ${commandString}`)
  const {command, args} = parseCommand(commandString)

  let options: any = {stdio: 'inherit', env: npmRunPath.env()}

  // ref: https://stackoverflow.com/questions/37459717/error-spawn-enoent-on-windows/37487465
  options = process.platform === 'win32' ? {...options, shell: true} : options

  return new Promise((resolve, reject) => {
    childProcess
      .spawn(command, args, options)
      .on('error', reject)
      .on('close', (exitCode) => {
        resolve({code: exitCode ?? 0})
      })
  })
}
