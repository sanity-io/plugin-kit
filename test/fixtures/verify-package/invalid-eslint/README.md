# sanity-plugin-test-plugin

## Installation

```
npm install --save sanity-plugin-test-plugin
```

or

```
yarn add sanity-plugin-test-plugin
```

## Usage

Add it as a plugin in sanity.config.ts (or .js):

```
 import {defineConfig} from 'sanity'
 import {myPlugin} from 'sanity-plugin-test-plugin'

 export const defineConfig({
     /...
     plugins: [
         myPlugin({})
     ]
 })
```

## License

MIT © Test Person
See LICENSE
