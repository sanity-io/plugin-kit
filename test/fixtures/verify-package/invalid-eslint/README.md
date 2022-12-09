# sanity-plugin-test-plugin

## Installation

```sh
npm install sanity-plugin-test-plugin
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {myPlugin} from 'sanity-plugin-test-plugin'

export default defineConfig({
  // ...
  plugins: [myPlugin({})],
})
```

## License

MIT © Test Person
See LICENSE
