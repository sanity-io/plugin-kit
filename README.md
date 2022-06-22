# @sanity/plugin-kit

> **NOTE**
>
> This is a developer preview package meant for **Sanity Studio v3** plugin development.
> 
> For a v2 alternative, consider using [Sanipack](https://github.com/rexxars/sanipack).

## What is it?

`@sanity/plugin-kit` is an opinionated, enhanced [Sanity.io](https://www.sanity.io/) v3 plugin development experience.

It provides a set of CLI commands for initializing, verifying and testing a Sanity plugin for Sanity Studio v3.
The verify-package command can be used when upgrading V2 plugins to Studio V3 versions.

@sanity/plugin-kit also comes with a verify-studio command that can be used to recommend upgrade steps in existing Sanity Studio v2 studio.

This package assumes and recommends [Parcel](https://parceljs.org/) for building,
and [Yalc](https://github.com/wclr/yalc) with watch for testing the plugin in Sanity Studio. 
Check the [FAQ](#faq) fro more on these.

## Table of contents

* [Installation](#installation)
* [Initialize a new plugin](#initialize-a-new-plugin)
* [Verify plugin package](#verify-plugin-package)
  * [Upgrading a v2 plugin](#upgrading-a-v2-plugin)
* [Upgrade help in v2 Studio](#upgrade-help-in-v2-studio)
* [Testing a plugin in Sanity Studio](#testing-a-plugin-in-sanity-studio)
* [FAQ](#faq) aka "Do I _have_ to use this plugin-kit?" aka No
* [Configuration reference](#configuration-reference)

## Installation

> npm install --save-dev @sanity/plugin-kit

### Install build tool

@sanity/plugin-kit assumes the plugin will use [Parcel](https://parceljs.org/) for build and watch:

> npm install --save-dev parcel

Parcel uses a build cache, you probably want to put `.parcel-cache` into `.gitignore`.

## Initialize a new plugin

### Quickstart

First, run the init command:
```bash
# Initialize a new plugin (outside of your Sanity studio folder)
npx @sanity/plugin-kit@latest init sanity-plugin-testing-it-out

# Make your plugin linkable, and compile an initial version
cd sanity-plugin-testing-it-out
npm run link-watch

# In another shell, link the plugin to your Sanity studio
cd /path/to/my-studio
yalc add --link sanity-plugin-testing-it-out && yarn install
```

Now, configure the plugin in sanity.config.ts (or .js) in Sanity Studio:
```ts
  import {createConfig} from 'sanity'
  import {myPlugin} from 'sanity-plugin-testing-it-out'
 
  export const createConfig({
      //...
      plugins: [
          myPlugin({})
      ]
  })
```

Start the studio:

```bash
sanity start
```

Check browser console: the plugin should have logged `"hello from my-sanity-plugin"`.
Since the plugin is running in watch mode, any changes you make to the plugin code will be reloaded in the studio.

## Verify plugin package

Verify that the plugin package is configured correctly by running:

> npx @sanity/plugin-kit@latest verify-package

### What does it do?

* Check package.json for:
  * recommended script commands
  * recommended cjs and esm configuration
  * sanity dependency compatibility
  * parcel devDependency
  * recommended usage of devDependencies/peerDependencies/dependencies for certain packages
* Check for redundant v2 config:
  * babel
  * rollup
  * sanity.json
* Check for sanity imports that has changed in v3, using eslint
* Check tsconfig.json settings
* Check for [SPDX](https://spdx.org/licenses/) compatible license definition
* If the package uses TypeScript, this will also run `tsc --noEmit` when all other checks have passed

Each check will explain why it is needed, steps to fix it and how it can be individually disabled.

### What it is *not*
`verify-package` is *not* a codemod tool (yet). It will only check files and recommended settings: it will not change any files.

### Upgrading a v2 plugin

Simply use the `verify-package` command in a v2 plugin package, and it will notify you about steps you need to take to upgrade the
plugin to v3.

```sh
npx @sanity/plugin-kit@latest verify-package
```

## Upgrade help in V2 Studio

You can use the `verify-studio` command in a v2 Sanity Studio to get some of the same validation there, to help in the upgrade from v2
to v3.

```sh
npx @sanity/plugin-kit@latest verify-studio
```

This will:

* Check for `sanity.json,` `sanity.config.(ts|js)` and `sanity.cli.(ts|js)` and advice on how to convert the former to the latter two.
* Check for sanity dependencies that has changed in v3
* Check for sanity imports that has changed in v3, using ESlint

### Fail fast mode

```sh
## for plugins
npx @sanity/plugin-kit@latest verify-package --single

## for studio
npx @sanity/plugin-kit@latest verify-package --studio --single
```

This will only output the first validation that fails. Useful when working through the list of issues by fixing and rerunning the command.

## Testing a plugin in Sanity Studio  

Ensure you have the following script setup in package.json:
```json
{
  "scripts": {
    "link-watch": "plugin-kit link-watch"
  }
}
```

Then, in a shell, run:

```sh
npm run link-watch
```

This will publish the plugin to a local [yalc](https://github.com/wclr/yalc) registry.

In another shell, in your test Sanity Studio directory, run:

```sh
npx yalc add <your-plugin-package> && npx yalc add <your-plugin-package> --link && npm install
```

You can now change your plugin code, which will:

1. Trigger a rebuild using your watch task
2. Update the files in the plugin output directory
3. Trigger a `yalc publish --push`
4. Update the files in your Sanity Studio
5. Trigger hot-reload; you should see changes in the Studio

**Note:** Yalc will modify your studio package.json when linking; remember to revert it when you are done testing.
You should also put `.yalc` and `yalc.lock` into `.gitignore`. 

When you are done testing, you can run
```
npx yalc remove <your-plugin-package> && yarn install
```
to restore the version in `package.json`.

### Link-watch configuration
This command can be configured using `sanityPlugin.linkWatch` in package.json:

```json5
{
  "sanityPlugin": {
    "linkWatch": {
      // directory to watch
      "folder": "lib",
      // command to run when content in linkWatch.folder changes
      "command": "npm run watch",
      // file extensions to watch for changes in the linkWatch.folder
      "extensions": "js,png,svg,gif,jpeg,css"
    }
  }
}
```

### Why use yalc?

See the [FAQ](#faq).

## Publishing a plugin

**Note:** If you're writing a plugin that is only useful for yourself or your company, 
you might want to develop the plugin directly in the Studio (saves you from having to publish at all, and has improved hot-reload dev experience).

If the plugin is shared across multiple "private" studios: register an organization on npm and make sure your module is
[prefixed with the organization scope](https://docs.npmjs.com/creating-and-publishing-private-packages), eg `@your-company/plugin-name`.

Also; you cannot easily remove modules/versions from npm once published. 
Take a good look at your `package.json` to see that the fields in there makes sense to you,
and make sure there are no "secrets" (authorization tokens, API keys or similar) in the plugin directory - 
anything not listed in `.npmignore` will be part of the published module.

When you're ready to publish, run `npm publish` (or `yarn publish` if you prefer). 
The `prepublishOnly` task should kick in and compile the source files, then verify the built output to ensure it looks good.

If you have not published any modules to npm before, you will be asked to create a user first.

## FAQ

#### Q: Do I _have_ to use this for developing Sanity plugins?

**A:** Absolutely not! Make sure your Sanity plugin is ES6-compatible.
This package was created to make it easier to set up the build toolchain and prevent common mistakes.

If you know what you're doing and don't like any magic, roll your own thing! :)

#### Q: Why use yalc? 

npm link & yarn link unfortunately can easily break the [rules of hooks](https://reactjs.org/docs/hooks-rules.html) due
to the way packages are resolved using symlinks. 

Yalc bypass this problem as it more closely resembles installing a dependency as normal.

#### Q: Do I have to use yalc?

**A:** No! 

Feel free to use any variation of `npm link` or `yarn link` alongside `npm run watch` for testing, 
but beware that if you get errors from React along the lines of

```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
This could happen for one of the following reasons:
- You might have mismatching versions of React and the renderer (such as React DOM)
- You might be breaking the Rules of Hooks
- You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.
```
 
you probably have to revert to using yalc, or use `npm pack` + and install the resulting tzg-file.

#### Q: Why use Parcel?

Parcel is recommended for building plugins as it provides sensible defaults for building a React library that
output CommonJS and ESM files. 

Parcel can in most cases be configured through `package.json` alone, and can often simply be dropped in to existing
packages without further customization . 
`@sanity/plugin-kit verify-package` ensures Sanity Studio 3 compliant configs exist.

Parcel also has very speedy production builds, which is a big plus when testing plugins using watch-mode.

**A:** Sanity Studio V3 uses [Vite](https://vitejs.dev/) as the default bundler, 

#### Q: Can I use another build tool or change parcel configuration?

**A:** Yes! 

Feel free to make any changes to [parcel library configuration](https://parceljs.org/getting-started/library/) as is needed.
`@sanity/plugin-sdk verify` output is only recommendations for defaults that has been tested to work in Sanity Studio. 
Your plugin may have other needs.

You are also free to not use parcel at all; simply change your package.json build script, and disable any verification-steps
you don't care for with `sanityPlugin.verifyPackage`.

## CLI Help

```sh
$ npx @sanity/plugin-kit --help 

Usage
  $ plugin-kit [--help] [--debug] <command> [<args>]

  These are common commands used in various situations:

    init            Create a new Sanity plugin
    verify-package  Verify that a Sanity plugin follows plugin-kit conventions
    splat           Inject plugin-kit compatible package config into an existing plugin directory
    link-watch      Recompile plugin automatically on changes and push to yalc
    version         Show the version of ${cliName} currently installed

  Options
    --silent      Do not print info and warning messages
    --verbose     Log everything. This option conflicts with --silent
    --debug       Print stack trace on errors
    --version     Output the version number
    --help        Output usage information

  Examples
    # Init a new plugin
    $ plugin-kit init

    # Verify that a Sanity plugin follows plugin-kit conventions
    $ plugin-kit verify-package
```

## Configuration reference

Provide a sanityPlugin config in package.json (defaults shown):

```json
{
  "sanityPlugin": {
    "linkWatch": {
      "folder": "lib",
      "command": "npm run watch",
      "extensions": "js,png,svg,gif,jpeg,css"
    }
  },
  "verifyPackage": {
    "packageName": true,
    "module": true,
    "tsconfig": true,
    "tsc": true,
    "dependencies": true,
    "rollupConfig": true,
    "babelConfig": true,
    "sanityV2Json": true,
    "eslintImports": true,
    "scripts": true,
    "parcel": true,
    "nodeEngine": true
  }
}
```

## License

MIT © [Espen Hovlandsdal](https://espen.codes/) and [Sanity.io](https://www.sanity.io/)

## Development

### Test in another package

In one shell, run
```sh
npm link
npm run watch
```

In the package where you want to test plugin kit, run:

```sh
npm link @sanity/plugin-kit
```

Now you can run commands:

```
npx @sanity/plugin-kit verify-package
```

or use them in package.json scripts:

```
"verify": "plugin-kit verify-package"
```

### Integration tests

```sh
npm run test
```

### Run a single test-file

```sh
npm run test -- test/verify-package.test.ts
```

### Update snapshots for a test

```sh
npm run test -- test/verify-package.test.ts --snapshot
```
