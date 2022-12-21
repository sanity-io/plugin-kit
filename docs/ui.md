# Preset: ui

## Usage

### Inject into existing package

`npx @sanity/plugin-kit inject --preset-only --preset ui`

### Use to init plugin

`npx @sanity/plugin-kit init --preset ui <new-plugin-name>`

## What does it do?

Sets up your package with [`@sanity/ui`](https://github.com/sanity-io/ui) to build plugin UIs.

- Adds [`@sanity/ui`](https://github.com/sanity-io/ui) dependency.
- Add required dev and peer dependencies.

## Manual steps after inject

- Run `npm i` to install dependencies.
- Refer to @sanity/ui [README](https://github.com/sanity-io/ui) for more.
