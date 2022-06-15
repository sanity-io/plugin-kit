import execa from 'execa'
import {prompt} from '../util/prompt'

export function npmIsAvailable() {
  return execa('npm', ['-v'])
    .then(() => true)
    .catch(() => false)
}

export function yarnIsAvailable() {
  return execa('yarn', ['-v'])
    .then(() => true)
    .catch(() => false)
}

export function pnpmAvailable() {
  return execa('pnpm', ['-v'])
    .then(() => true)
    .catch(() => false)
}

export async function promptForPackageManager() {
  const [npm, yarn, pnpm] = await Promise.all([
    npmIsAvailable(),
    yarnIsAvailable(),
    pnpmAvailable(),
  ])

  const choices = [npm && 'npm', yarn && 'yarn', pnpm && 'pnpm'].filter(Boolean)
  if (choices.length < 2) {
    return choices[0] || 'npm'
  }

  return prompt('Which package manager do you prefer?', {
    choices: choices.map((value) => ({value, name: value})),
    default: choices[0],
  })
}

export async function installDependencies(pm: string, {cwd}: {cwd?: string}) {
  const proc = execa(pm, ['install'], {cwd, stdio: 'inherit'})
  const {exitCode} = await proc
  return exitCode <= 0
}
