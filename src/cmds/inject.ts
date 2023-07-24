import {loadConfig as loadPackageConfig} from '@sanity/pkg-utils'
import path from 'path'
import meow from 'meow'
import log from '../util/log'
import {inject} from '../actions/inject'
import {findStudioV3Config} from '../sanity/manifest'
import {initFlags} from '../actions/init'
import {cliName, defaultOutDir} from '../constants'
import {presetHelpList} from '../presets/presets'

const description = `Inject configuration into a Sanity plugin`

const help = `
Usage
  $ ${cliName} inject [dir] [<args>]

Options
  --no-eslint             Disables ESLint config and dependencies from being added
  --no-prettier           Disables prettier config and dependencies from being added
  --no-typescript         Disables typescript config and dependencies from being added
  --no-license            Disables LICENSE + package.json license field from being added
  --no-editorconfig       Disables .editorconfig from being added
  --no-gitignore          Disables .gitignore from being added
  --no-scripts            Disables scripts from being added to package.json

  --license [spdx]        Use the license with the given SPDX identifier
  --force                 No promt when overwriting files

  --preset [preset-name]  Adds config and files from a named preset. --preset can be supplied multiple times.
                          The following presets are available:
${presetHelpList(30)}
  --preset-only           Skips the default inject steps. Use this to apply a preset to an otherwise complete plugin.

Examples
  # Inject configuration into the plugin in the current directory
  $ ${cliName} inject

  # Inject configuration into the plugin in ~/my-plugin
  $ ${cliName} inject ~/my-plugin

  # Don't inject eslint or prettier
  $ ${cliName} inject --no-eslint --no-prettier

  # Inject plugin configuration and semver-workflow into the plugin in the current directory
  $ @sanity/plugin-kit inject --preset semver-workflow

  # Only inject semver-workflow and renovatebot config from presets
  $ ${cliName} inject --preset-only --preset semver-workflow --preset renovatebot

`

async function run({argv}: {argv: string[]}) {
  const cli = meow(help, {flags: initFlags, argv, description})
  const basePath = path.resolve(cli.input[0] || process.cwd())
  const packageConfig = await loadPackageConfig({cwd: basePath})
  const outDir = packageConfig?.dist ?? defaultOutDir

  const {v3ConfigFile} = await findStudioV3Config(basePath)
  if (v3ConfigFile) {
    throw new Error(
      `${v3ConfigFile} exists - are you trying to INJECT into a studio instead of a plugin?`,
    )
  }
  log.info('Inject config into plugin in "%s"', basePath)

  await inject({basePath, outDir, flags: cli.flags, validate: false})
  log.info('Done!')
}

export default run
