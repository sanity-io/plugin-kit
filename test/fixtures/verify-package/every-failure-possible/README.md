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
 import {createConfig} from 'sanity'
 import {myPlugin} from 'my-plugin'

 export const createConfig({
     /...
     plugins: [
         myPlugin({})
     ]
 })
```
## License

MIT © Snorre Brekke
See LICENSE