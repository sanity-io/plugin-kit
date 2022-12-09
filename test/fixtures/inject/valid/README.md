# sanity-plugin-test-plugin

## Installation

```sh
npm install sanity-plugin-test-plugin
```

## Usage

Install the plugin in your [Sanity Studio](https://sanity.io/studio) configuration 
`sanity.config.ts` (or `.js`):

```ts
import {defineConfig} from 'sanity'
import {myPlugin} from 'sanity-plugin-test-plugin'

export default defineConfig({
  // ...
  plugins: [myPlugin({})],
})
```

## License

[MIT](LICENSE) © Test Person
