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
- Compiles plugin source using Babel

## Quick start (bootstrap new plugin)

```bash
npx sanipack init
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

## Todo

- [ ] symlink command?
- [ ] watch command?

## License

MIT © [Espen Hovlandsdal](https://espen.codes/)
