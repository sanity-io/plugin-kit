# Preset: renovatebot

## Usage

### Inject into existing package

`npx @sanity/plugin-kit@latest inject --preset-only --preset renovatebot`

### Use to init plugin

`npx @sanity/plugin-kit@latest init --preset renovatebot <new-plugin-name>`

## What does it do?

Sets up the repo

- Adds Sanity dependabot preset dependency.
- Adds `renovate.json` to configure the above dependency for Renovatebot

## Manual steps after inject

After injection, Renovate bot must be enabled for the repo on Github.

This can be done by adding the repo to Github Renovatebot app allow-list.
