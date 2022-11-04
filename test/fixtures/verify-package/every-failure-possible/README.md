# my-plugin

## Installation

```
npm install --save my-plugin
```

or

```
yarn add my-plugin
```

## Usage

Add it as a plugin in sanity.config.ts (or .js):

```
 import {defineConfig} from 'sanity'
 import {myPlugin} from 'my-plugin'

 export const defineConfig({
     /...
     plugins: [
         myPlugin({})
     ]
 })
```

## License

MIT © Snorre Brekke
See LICENSE
