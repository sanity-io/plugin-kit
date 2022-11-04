/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/verify-package.test.ts TAP plugin-kit verify-package in ok package > stdout should match snapshot 1`] = `
[success] No outstanding upgrade issues detected.

Suggested next steps:
  - Use plugin-kit to build and develop the plugin according to https://github.com/sanity-io/plugin-kit.
  - Build the plugin and fix any compilation errors
  - Test the plugin using the link-watch command
`

exports[`test/verify-package.test.ts TAP plugin-kit verify-package in package with all checks failing > stderr should match snapshot 1`] = `
[error] 
Invalid package.json: "name" should be prefixed with "sanity-plugin-" (or scoped - @your-company/plugin-name)

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "packageName": false
   }
}
----------------------------------------------------------
[error] 
package.json does not list @sanity/pkg-utils as a devDependency.
@sanity/pkg-utils replaced parcel as the recommended build tool in @sanity/plugin-kit 2.0.0

Please add it by running 'npm install --save-dev @sanity/pkg-utils'.

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "pkg-utils": false
   }
}
----------------------------------------------------------
[error] 
Expected one of [src/index.js, src/index.ts] to exist.

@sanity/pkg-utils expects a non-jsx file to be the source entry-point for the plugin.
If you currently have JSX in your index file, extract it into a separate file and import it.

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "srcIndex": false
   }
}
----------------------------------------------------------
[error] 
The following script commands did not contain expected defaults: prebuild, build, watch, link-watch, prepublishOnly

This checks for that the commands-strings includes these terms.
For example, this will validate ok:
"prebuild": "npm run clean && plugin-kit verify-package --silent && pkg-utils",

Please add the following to your package.json "scripts":

"prebuild": "plugin-kit verify-package --silent && pkg-utils",
"build": "pkg-utils build",
"watch": "pkg-utils watch",
"link-watch": "plugin-kit link-watch",
"prepublishOnly": "npm run build"

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "scripts": false
   }
}
----------------------------------------------------------
[error] 
Expected source, exports, main, module and files entries in package.json, but source, exports, main, module where missing.

Example:

Given a plugin with entry-point in src/index.ts, using default @sanity/pkg-utils build command,
package.json should contain the following entries to ensure that commonjs and esm outputs are built into lib:

"source": "./src/index.ts",
"exports": {
  ".": {
    "types": "./lib/src/index.d.ts",
    "source": "./src/index.ts",
    "import": "./lib/index.esm.js",
    "require": "./lib/index.js",
    "default": "./lib/index.js"
  }
},
"main": "./lib/index.js",
"module": "./lib/index.esm.js",
"types": "./lib/src/index.d.ts",
"files": [
  "src",
  "lib"
],

Refer to @sanity/pkg-utils for more: https://github.com/sanity-io/pkg-utils#sanitypkg-utils

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "module": false
   }
}
----------------------------------------------------------
[error] 
Expected package.json to contain engines.node: ">=14" to ensure Studio compatible builds,
but it was: undefined

Please add the following to package.json:

"engines": {
  "node": ">=14"
}

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "nodeEngine": false
   }
}
----------------------------------------------------------
[error] 
Recommended tsconfig.json compilerOptions missing:

The following fields had unexpected values: [jsx, moduleResolution, target, module, sourceMap, inlineSourceMap, esModuleInterop, skipLibCheck, isolatedModules, downlevelIteration, declaration, allowSyntheticDefaultImports, rootDir]
Expected to find these values:
"jsx": "preserve",
"moduleResolution": "node",
"target": "esnext",
"module": "esnext",
"sourceMap": false,
"inlineSourceMap": false,
"esModuleInterop": true,
"skipLibCheck": true,
"isolatedModules": true,
"downlevelIteration": true,
"declaration": true,
"allowSyntheticDefaultImports": true,
"rootDir": "src",

Please update your tsconfig.json accordingly.

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "tsconfig": false
   }
}
----------------------------------------------------------
[error] 
Invalid sanity.json. It is used for compatibility checking in V2 studios:

- The part should implement part:@sanity/base/sanity-root, but did not.
- The file in "path", ./src/index.js, does not exist.
- package.json should have @sanity/incompatible-plugin as a dependency, but did not.
  Install it with: npm install --save @sanity/incompatible-plugin

sanity.json will only be used when incorrectly installing a v3 plugin in a v2 Studio.

This check ensures that sanity.json conforms with the usage section of
https://github.com/sanity-io/incompatible-plugin

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "sanityV2Json": false
   }
}
----------------------------------------------------------
[error] 
Found babel-config file: root/babel.config.js. When using default @sanity/plugin-kit build command,
this is probably not needed.

Delete the root/babel.config.js file, or disable this check.

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "babelConfig": false
   }
}
----------------------------------------------------------
[error] 
package.json depends on "@sanity/*" packages that have moved into "sanity" package.

The following dependencies should be replaced with "sanity":
- @sanity/base

Refer to the reference docs to find replacement imports:
https://beta.sanity.io/docs/reference

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "dependencies": false
   }
}
----------------------------------------------------------
[error] 
package.json contains deprecated dependencies that should be removed:
- parcel

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "deprecatedDependencies": false
   }
}
----------------------------------------------------------
[error] 

root/src/index.tsx
  1:1  error  '@sanity/base' import is restricted from being used by a pattern. Use sanity instead of @sanity/base                  no-restricted-imports
  2:1  error  '@sanity/form-builder' import is restricted from being used by a pattern. Use sanity instead of @sanity/form-builder  no-restricted-imports

✖ 2 problems (2 errors, 0 warnings)
ESLint detected Studio V2 imports that are no longer available.
It is recommended configure @sanity/eslint-config-no-v2-imports for ESLint.

Run:
npm install --save-dev @sanity/eslint-config-no-v2-imports

In .eslintrc add:
"extends": ["@sanity/no-v2-imports"]

This way, V2-imports can be identified directly in the IDE, or using eslint CLI.
For more, see https://github.com/sanity-io/eslint-config-no-v2-imports

If the plugin package does not use eslint, disable this check.

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "eslintImports": false
   }
}
----------------------------------------------------------
[error] Detected validation issues!
To make this package Sanity v3 compatible, fix the issues starting from the top, or disable any checks you deem unnecessary.

These issues assume the package uses @sanity/plugin-kit defaults for development and building.
Refer to https://github.com/sanity-io/plugin-kit for configuration options.

More information is available here:
- Studio migration guide: https://beta.sanity.io/docs/platform/v2-to-v3
- Plugin migration guide: https://beta.sanity.io/docs/platform/v2-to-v3/plugins
- Reference documentation: https://beta.sanity.io/docs/reference

To fail-fast on first detected issue run:
npx @sanity/plugin-kit verify-package' --single
`

exports[`test/verify-package.test.ts TAP plugin-kit verify-package in package with invalid eslint config > stderr should match snapshot 1`] = `
[error] Failed to run eslint check Error: Failed to load config "this-does-not-exist" to extend from.
Referenced from: root/.eslintrc
    at configInvalidError root/node_modules/@eslint/eslintrc/lib/config-array-factory.js:302:9)
    at ConfigArrayFactory._loadExtendedShareableConfig root/node_modules/@eslint/eslintrc/lib/config-array-factory.js:933:23)
    at ConfigArrayFactory._loadExtends root/node_modules/@eslint/eslintrc/lib/config-array-factory.js:810:25)
    at ConfigArrayFactory._normalizeObjectConfigDataBody root/node_modules/@eslint/eslintrc/lib/config-array-factory.js:749:25)
    at _normalizeObjectConfigDataBody.next (<anonymous>)
    at ConfigArrayFactory._normalizeObjectConfigData root/node_modules/@eslint/eslintrc/lib/config-array-factory.js:694:20)
    at _normalizeObjectConfigData.next (<anonymous>)
    at ConfigArrayFactory.loadInDirectory root/node_modules/@eslint/eslintrc/lib/config-array-factory.js:540:28)
    at CascadingConfigArrayFactory._loadConfigInAncestors root/node_modules/@eslint/eslintrc/lib/cascading-config-array-factory.js:392:46)
    at CascadingConfigArrayFactory.getConfigArrayForFile root/node_modules/@eslint/eslintrc/lib/cascading-config-array-factory.js:313:18) {
  messageTemplate: 'extend-config-missing',
  messageData: {
    configName: 'this-does-not-exist',
    importerName: root/.eslintrc'
  }
}
[error] 
Failed to run ESLint. Is ESLint configured?
It is recommended to install eslint-config-sanity and add 'sanity/upgrade-v2' to your eslint-extends config.

Run:
npm install --save-dev eslint-config-sanity

In .eslintrc add:
extends: ['sanity/upgrade-v2']

This way, V2-imports can be identified directly in the IDE, or using eslint CLI.
If the package does not use eslint, disable this check.

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "eslintImports": false
   }
}
----------------------------------------------------------
[error] Detected validation issues!
To make this package Sanity v3 compatible, fix the issues starting from the top, or disable any checks you deem unnecessary.

These issues assume the package uses @sanity/plugin-kit defaults for development and building.
Refer to https://github.com/sanity-io/plugin-kit for configuration options.

More information is available here:
- Studio migration guide: https://beta.sanity.io/docs/platform/v2-to-v3
- Plugin migration guide: https://beta.sanity.io/docs/platform/v2-to-v3/plugins
- Reference documentation: https://beta.sanity.io/docs/reference

To fail-fast on first detected issue run:
npx @sanity/plugin-kit verify-package' --single
`

exports[`test/verify-package.test.ts TAP plugin-kit verify-studio in fresh v2 studio > stderr should match snapshot 1`] = `
[error] 
Found sanity.json. This file is not used by Sanity Studio V3.

Please consult the Studio V3 migration guide:
 https://beta.sanity.io/docs/platform/v2-to-v3
It will detail how to convert sanity.json to sanity.config.ts (or .js) and sanity.cli.ts (or .js) equivalents.

For V3 versions and alternatives to V2 plugins, please refer to the Sanity Exchange:
https://www.sanity.io/exchange

---

sanity.cli.(ts | js | tsx | jsx) missing. Please create a file named sanity.cli.ts with the following content:

import {createCliConfig} from 'sanity/cli'

export default createCliConfig({
  api: {
    projectId: 'q5ivv38k',
    dataset: 'production',
  }
})

Make sure to replace the projectId and dataset fields with your own.

For more, see https://beta.sanity.io/docs/platform/v2-to-v3

---

sanity.config.(ts | js | tsx | jsx) missing. At a minimum sanity.config.ts should contain:

import { defineConfig } from "sanity"
import { deskTool } from "sanity/desk"

export default defineConfig({
  name: "default",

  projectId: 'q5ivv38k',
  dataset: 'production',

  plugins: [
    deskTool(),
  ],

  schema: {
    types: [
      /* put your v2 schema-types here */
    ],
  },
})

Make sure to replace the projectId and dataset fields with your own.

For more, see https://beta.sanity.io/docs/platform/v2-to-v3

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "studioConfig": false
   }
}
----------------------------------------------------------
[error] 
package.json depends on "@sanity/*" packages that have moved into "sanity" package.

The following dependencies should be replaced with "sanity":
- @sanity/base
- @sanity/core
- @sanity/default-layout
- @sanity/default-login
- @sanity/desk-tool

Refer to the reference docs to find replacement imports:
https://beta.sanity.io/docs/reference

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "dependencies": false
   }
}
----------------------------------------------------------
[error] 

root/schemas/schema.js
  2:1  error  'part:@sanity/base/schema-creator' import is restricted from being used by a pattern. part: imports where removed in Sanity v3. Please refer to the migration guide: https://beta.sanity.io/docs/platform/v2-to-v3, or new API-reference docs: https://beta.sanity.io/docs/reference       no-restricted-imports
  4:1  error  'all:part:@sanity/base/schema-type' import is restricted from being used by a pattern. all:part: imports where removed in Sanity v3. Please refer to the migration guide: https://beta.sanity.io/docs/platform/v2-to-v3, or new API-reference docs: https://beta.sanity.io/docs/reference  no-restricted-imports

✖ 2 problems (2 errors, 0 warnings)
ESLint detected Studio V2 imports that are no longer available.
It is recommended configure @sanity/eslint-config-no-v2-imports for ESLint.

Run:
npm install --save-dev @sanity/eslint-config-no-v2-imports

In .eslintrc add:
"extends": ["@sanity/no-v2-imports"]

This way, V2-imports can be identified directly in the IDE, or using eslint CLI.
For more, see https://github.com/sanity-io/eslint-config-no-v2-imports

If the plugin package does not use eslint, disable this check.

To skip this validation add the following to your package.json:
"sanityPlugin": {
   "verifyPackage": {
      "eslintImports": false
   }
}
----------------------------------------------------------
[error] Detected validation issues!
This Sanity Studio is not completely V3 ready. Fix the issues starting from the top, or disable any checks you deem unnecessary.

More information is available here:
- Migration guide: https://beta.sanity.io/docs/platform/v2-to-v3
- Reference documentation: https://beta.sanity.io/docs/reference

To fail-fast on first detected issue run:
npx @sanity/plugin-kit verify-studio --single
`
