# Preset: ui-workshop

## Usage

### Inject into existing package
`npx @sanity/plugin-kit inject --preset-only --preset ui-workshop`

### Use to init plugin
`npx @sanity/plugin-kit init --preset ui-workshop <new-plugin-name>`

## What does it do?

Sets up your package with [@sanity/ui-workshop](https://github.com/sanity-io/ui-workshop),
to make component testing a breeze.

- Adds [@sanity/ui-workshop](https://github.com/sanity-io/ui-workshop) dev dependency.
- Adds a example files for testing components using @sanity/ui-workshop
- Adds .workshop to .gitignore
- 
## Manual steps after inject

* Run `npm i` to install dependencies.
* Start the workshop with `workshop dev`.
* Put your plugin/package components into workshop to test them.
* Refer to @sanity/ui-workshop [README](https://github.com/sanity-io/ui-workshop#basic-usage) for more.

