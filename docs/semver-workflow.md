# Preset: semver-workflow

Add opinionated config and dependencies used by the Ecosystem team on Sanity to develop using
semantic-release driven workflow on Github for Sanity v3 plugins.

## Manual steps after inject

### 1. Install new dependencies

Run

```bash
npm install
```

### 2. Check README.md

The preset changes README.md in a naive manner.
Some text could be redundant or unnecessary depending on context and search for TODO.

Move text around until it looks good. Remember to change any v2 usage examples.

### 3. Update `.github/workflows/main.yml` branches

This differs from repo to repo, default is `[main]`

In a typical plugin repo with a v2 and v3 version, it will typically look like this:

```yml
# .github/workflows/main.yml
name: CI & Release
on:
  push:
    branches: [main, v3]
```

### 4. Check secrets

Ensure that your repo or Github org has set the secrets used by the workflow.

`secrets.GITHUB_TOKEN` should always be available by default, but
`secrets.NPM_PUBLISH_TOKEN` is not.

Secrets can be set using `Settings -> Secrets -> Actions -> "New repository secret"`
on Github for a repository.

### 5. Update .releaserc.json

This differs from repo to repo. Branches defaults to `"branches": ["main"]`

In a typical plugin repo with a v2 and v3 version, it will typically look like this:

```json
{
  "extends": "@sanity/semantic-release-preset",
  "branches": ["main", {"name": "v3", "channel": "studio-v3", "prerelease": "v3-studio"}]
}
```

This assumes that the v2 version lives on `main` and the v3 versions livs on `v3`.
The v3 version will be a pre-release using `studio-v3` as npm tag, and `v3-studio` version suffix.

### 6. Test workflow and remove `--dry-run`

The injected semantic-release command in `.github/workflows/main.yml` has `--dry-run` enabled.

Before removing the flag, perform a release on Github by manually triggering the `CI & Release`
workflow for the V3-branch and check "Release new version".

Inspect the workflow logs to see the version that will be used for the release.
If it is ok, remove the `--dry-run` flag from the workflow to perform a real release.
If the version is not what you expected, you might have to perform some
[troubleshooting](https://semantic-release.gitbook.io/semantic-release/support/troubleshooting).

#### Testing semantic-release locally

Create a github token with push access and set it in your shell as GH_TOKEN.

Now run:
`GH_TOKEN=$GH_TOKEN npx semantic-release --no-ci --dry-run --debug`

This will run semantic-release in dry-run mode (no git push or npm publish) and show everything that would
go into a release.

## What does it do?

Adds opinionated config and dependencies used by the Ecosystem team on Sanity to develop using
semantic-release driven workflow on Github.

- Adds husky and related files and dependencies to do pre-commit checks
- Adds semantic-release and preset dependencies to automate npm & Github releases
- Updates README.md with some standard texts
