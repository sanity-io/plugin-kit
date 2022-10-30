# Presets

## semver-workflow

### Manual steps after inject

#### 1. Update `.github/workflows/main.yml` branches
This differs from repo to repo.

In a typical plugin repo with a v2 and v3 version, it will typically look like this:

```yml
# .github/workflows/main.yml
name: CI & Release
on:
  # Build on pushes to release branches
  push:
    branches: [main, v3]
  # Build on pull requests targeting release branches
  pull_request:
    branches: [main, v3]
```

#### 2. Update .releaserc.json
This differs from repo to repo.

In a typical plugin repo with a v2 and v3 version, it will typically look like this:

```json
{
  "extends": "@sanity/semantic-release-preset",
  "branches": [
    "main",
    { "name": "v3", "channel": "studio-v3", "prerelease": "v3-studio" }
  ]
}
```

This assumes that the v2 version lives on `main` and the v3 versions livs on `v3`.
The v3 version will be a pre-release using `studio-v3` as npm tag, and `v3-studio` version suffix.

#### 3. Test workflow and remove `--dry-run`

The injected semantic-release command in `.github/workflows/main.yml` has `--dry-run` enabled.

Before removing the flag, perform a release on Github by manually triggering the `CI & Release`
workflow for the V3-branch and check "Release new version".

Inspect the workflow logs to see the version that will be used for the release.
If it is ok, remove the `--dry-run` flag from the workflow to perform a real release.
If the version is not what you expected, you might have to perform some 
[troubleshooting](https://semantic-release.gitbook.io/semantic-release/support/troubleshooting).


### What does it do?

Adds opinionated config and dependencies used by the Ecosystem team on Sanity to develop using
semantic-release driven workflow on Github.

* Adds husky and related files and dependencies to do pre-commit checks
* Adds semantic-release and preset dependencies to automate npm & Github releases

## renovate

### Manual steps after inject

After injection, Renovate bot must be enabled for the repo on Github.

This can be done by adding the repo to Github Renovatebot app allow-list.

### What does it do?

Sets up the repo

* Adds Sanity dependabot preset dependency.
* Adds `renovate.json` to configure the above dependency for Renovatebot

