<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.0.0 (2022-08-17)

### Bug Fixes

- **build:** allow filenames with multiple dots ([e577652](https://github.com/sanity-io/plugin-kit/commit/e5776527af48f3d05533e6b277166e8daa53db26)), closes [#4](https://github.com/sanity-io/plugin-kit/issues/4)
- changed recommended link command to work with npm ([a204163](https://github.com/sanity-io/plugin-kit/commit/a204163f1785b41ac3f719dfd0c4a6faf1bbd992))
- **eslint:** add lib (compiled output) to ignorePatterns, drop prettier/react extension ([f9fab24](https://github.com/sanity-io/plugin-kit/commit/f9fab24cfeec538979d6bc9cfe5deeaded3b2dd7))
- **npm:** lock eslint to ^7.0.0 ([dda5eb1](https://github.com/sanity-io/plugin-kit/commit/dda5eb17b073ff1a2f96ad28d12b44e84eef9453))
- **npm:** use semver range for dependencies ([30768d2](https://github.com/sanity-io/plugin-kit/commit/30768d24839626af84661c09bb9f99d3fe6a2d20))
- setup `@sanity/semantic-release-preset` ([751bdbc](https://github.com/sanity-io/plugin-kit/commit/751bdbcc88a364bf97f262bbb36360f87cfd2e39))
- spawning child process on windows ([#7](https://github.com/sanity-io/plugin-kit/issues/7)) ([f82bd4d](https://github.com/sanity-io/plugin-kit/commit/f82bd4daf2741d12eb8391eaf14e2fc7d6d2a6f2))
- tap.includes -> tap.match ([a9b58d7](https://github.com/sanity-io/plugin-kit/commit/a9b58d75d2527ed44fc98921dcd4276d7c944bef))
- test full absolute path before trying alternatives ([dacf59e](https://github.com/sanity-io/plugin-kit/commit/dacf59eb0652451417a86a6600b85a8ee746015d))
- **tests:** normalize npm-packlist paths ([60812c2](https://github.com/sanity-io/plugin-kit/commit/60812c2dcf5508388cb5c24ccf56f6ba268cd388))
- **tests:** normalize path in cli.test.js ([c2bc162](https://github.com/sanity-io/plugin-kit/commit/c2bc162f3c811290aa3f155e48ce6353e0bae4b8))
- **tests:** replace doesNotHave with notMatch ([b8bcf94](https://github.com/sanity-io/plugin-kit/commit/b8bcf946ab582c18bd98c2b6f83ac718511c10b3))
- **verify:** allow query parameters on imports (raw css etc) ([51339b1](https://github.com/sanity-io/plugin-kit/commit/51339b1957c37f972325d01c5ca016972db0b87e))

### chore

- drop support for node 10 ([cfd00b1](https://github.com/sanity-io/plugin-kit/commit/cfd00b13df6fbb096fe1f8a865351aa6847fdd99))

### Features

- assert @sanity/ui + @sanity/icons are dependencies if used ([1b5a3f1](https://github.com/sanity-io/plugin-kit/commit/1b5a3f1e7259af04c377bac3cd07de87c7d63aae))
- initial version ([7c2569a](https://github.com/sanity-io/plugin-kit/commit/7c2569a9365636ad827fd1e375220e48005077e9))
- **npm:** add lint task to scripts ([33823a7](https://github.com/sanity-io/plugin-kit/commit/33823a74d1ab6e1cc060b88572d9dc7a5d1e337f))

### BREAKING CHANGES

- We no longer support node 10, because it is out of LTS