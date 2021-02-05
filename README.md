# sanipack

[![npm version](https://img.shields.io/npm/v/sanipack.svg?style=flat-square)](https://www.npmjs.com/package/sanipack)[![Build Status](https://img.shields.io/github/workflow/status/rexxars/sanipack/CI/main.svg?style=flat-square)](https://github.com/rexxars/sanipack/actions?query=workflow%3ACI)

An opinionated, enhanced [Sanity.io](https://www.sanity.io/) plugin development experience.

## Features

- Bootstrap new plugins with (opinionated) tooling:
  - [ESLint](https://eslint.org/) (with [Sanity config](https://github.com/sanity-io/sanity/tree/next/packages/eslint-config-sanity))
  - [Prettier](https://prettier.io/) (with Sanity settings)
  - [EditorConfig](https://editorconfig.org/) (with Sanity settings)
  - [.gitignore](https://git-scm.com/docs/gitignore) + [.npmignore](https://docs.npmjs.com/cli/v6/using-npm/developers#keeping-files-out-of-your-package)
  - Build scripts (pre-publish build + verify)
- Verifies plugin conventions before publishing:
  - No unused dependencies
  - No undeclared dependencies
  - Referenced files exist, has correct casing and is publishable
  - Has an [SPDX](https://spdx.org/licenses/) compatible license definition
  - Has a valid plugin config, if present
  - `react`/`react-dom` declared as peer dependencies, if used
  - ... and more ...
- Compiles plugin source code using Babel

## Quick start

```bash
# Initialize a new plugin (outside of your Sanity studio folder)
npx sanipack init sanity-plugin-spotify

# Make your plugin linkable, and compile an initial version
cd sanity-plugin-spotify
npm link
npm run build

# Link the plugin to your Sanity studio and start it
cd /path/to/my-studio
npm link sanity-plugin-spotify
sanity start

# In another terminal, start a watch task for your plugin
cd /path/to/sanity-plugin-spotify
npm run watch
```

## Usage

```
Enhanced Sanity.io plugin development experience

Usage
  $ sanipack [--help] [--debug] <command> [<args>]

  These are common commands used in various situations:

    build    Compile a Sanity plugin (prior to publishing)
    init     Create a new Sanity plugin
    splat    Inject sanipack into an existing Sanity plugin
    verify   Verify a Sanity plugin prior to publishing
    version  Show the version of sanipack currently installed

  Options
    --silent      Do not print info and warning messages
    --verbose     Log everything. This option conflicts with --silent
    --debug       Print stack trace on errors
    --version     Output the version number
    --help        Output usage information

  Examples
    # Build a Sanity plugin for publishing
    $ sanipack build

    # Verify that a Sanity plugin is ready to be published
    # (great for pre-publish step!)
    $ sanipack verify
```

Use the `--help` flag on each command for more information on their usage, eg `sanipack build --help`.

## Publishing a plugin

**Note:** If you're writing a plugin that is only useful for yourself or your company, you might want to either put the plugin inside of the `plugins` folder of your Sanity studio (saves you from having to publish at all), or if shared across multiple "private" studios: register an organization on npm and make sure your module is [prefixed with the organization scope](https://docs.npmjs.com/creating-and-publishing-private-packages), eg `@your-company/plugin-name`.

Also; you cannot easily remove modules/versions from npm once published. Take a good look at your `package.json` to see that the fields in there makes sense to you, and make sure there are no "secrets" (authorization tokens, API keys or similar) in the plugin directory - anything not listed in `.npmignore` will be part of the published module.

When you're ready to publish, run `npm publish` (or `yarn publish` if you prefer). The `prepublishOnly` task should kick in and compile the source files, then verify the built output to ensure it looks good.

If you have not published any modules to npm before, you will be asked to create a user first.

## FAQ

**Q:** Do I _have_ to use this for developing Sanity plugins?

**A:** Absolutely not! Make sure your Sanity plugin is ES5-compatible and that your `sanity.json` file and any references parts refer to the right directories, and you're good to go. This package was created to make it easier to set up the build toolchain and prevent common mistakes. If you know what you're doing and don't like any magic, roll your own thing! :)

## License

MIT © [Espen Hovlandsdal](https://espen.codes/)
