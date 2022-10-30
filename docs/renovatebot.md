# Preset: renovatebot

## Manual steps after inject

After injection, Renovate bot must be enabled for the repo on Github.

This can be done by adding the repo to Github Renovatebot app allow-list.

## What does it do?

Sets up the repo

* Adds Sanity dependabot preset dependency.
* Adds `renovate.json` to configure the above dependency for Renovatebot

