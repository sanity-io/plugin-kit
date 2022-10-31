<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.0-ecosystem-preset.9](https://github.com/sanity-io/plugin-kit/compare/v1.1.0-ecosystem-preset.8...v1.1.0-ecosystem-preset.9) (2022-10-31)

### Bug Fixes

- **semantic-workflow:** filter out README sections that exists "close enough" ([774d474](https://github.com/sanity-io/plugin-kit/commit/774d47437d523adfae7a7c44e506eea743202593))
- **semantic-workflow:** npmrc bundling ([aa81d57](https://github.com/sanity-io/plugin-kit/commit/aa81d57e95f0fdd4818bc43f4b706f8ec7aef6e6))

## [1.1.0-ecosystem-preset.8](https://github.com/sanity-io/plugin-kit/compare/v1.1.0-ecosystem-preset.7...v1.1.0-ecosystem-preset.8) (2022-10-31)

### Features

- semver-workflow now injects .npmrc with legacy-peer-deps=true ([1c78e99](https://github.com/sanity-io/plugin-kit/commit/1c78e99121fe637fdddc4d2066541420aaa063d3))

### Bug Fixes

- use correct @sanity/ui package name ([a01dfcd](https://github.com/sanity-io/plugin-kit/commit/a01dfcdf31d22e16d7425a63abb7c905e3a5ee17))

## [1.1.0-ecosystem-preset.7](https://github.com/sanity-io/plugin-kit/compare/v1.1.0-ecosystem-preset.6...v1.1.0-ecosystem-preset.7) (2022-10-30)

### Features

- inject adds the same dependencies as init now ([7c69488](https://github.com/sanity-io/plugin-kit/commit/7c69488531efde08b3af1af245e310fdc8a5a676))

## [1.1.0-ecosystem-preset.6](https://github.com/sanity-io/plugin-kit/compare/v1.1.0-ecosystem-preset.5...v1.1.0-ecosystem-preset.6) (2022-10-30)

### Features

- build related package.json entries are overridden instead of retained ([f2ccd15](https://github.com/sanity-io/plugin-kit/commit/f2ccd15b4361056186947be10bf42307406b1681))
- force package versions and made stricter verifications ([735b0fc](https://github.com/sanity-io/plugin-kit/commit/735b0fc221ccafbe1ea94d790c55507e676319a7))
- preset semantic-release now updates README.md when it exists (naively) ([6e09385](https://github.com/sanity-io/plugin-kit/commit/6e093855fb1c6c6c55016e83d53be887c9b26461))

### Bug Fixes

- forced dependencies now works correctly ([67d3cee](https://github.com/sanity-io/plugin-kit/commit/67d3ceed7702a180de708c02e7125712bb27ced5))
- readme newlines ([88879fe](https://github.com/sanity-io/plugin-kit/commit/88879fe2ed10be0e87c5c1031be50341a4d94541))
- url readme url ([6615d96](https://github.com/sanity-io/plugin-kit/commit/6615d96108dabe4aa2eb11efc619a39e31e91287))
- verify-studio config file detection support for tsx and jsx ([73e27bc](https://github.com/sanity-io/plugin-kit/commit/73e27bc0dbc84153b2067d4c5a67f897d2e6b886))

## [1.1.0-ecosystem-preset.5](https://github.com/sanity-io/plugin-kit/compare/v1.1.0-ecosystem-preset.4...v1.1.0-ecosystem-preset.5) (2022-09-02)

### Bug Fixes

- added --dry-run flag to release job for safety ([4afb7c2](https://github.com/sanity-io/plugin-kit/commit/4afb7c2fd93a6ee6ecbc50ee70e134297c2bb543))

## [1.1.0-ecosystem-preset.4](https://github.com/sanity-io/plugin-kit/compare/v1.1.0-ecosystem-preset.3...v1.1.0-ecosystem-preset.4) (2022-09-02)

### Bug Fixes

- show note about manual config steps in semver-workflow ([40d5fba](https://github.com/sanity-io/plugin-kit/commit/40d5fba3178c14f548fb4aca848ad244465e46ae))

## [1.1.0-ecosystem-preset.3](https://github.com/sanity-io/plugin-kit/compare/v1.1.0-ecosystem-preset.2...v1.1.0-ecosystem-preset.3) (2022-09-01)

### Bug Fixes

- add missing lint-staged config ([53c17f5](https://github.com/sanity-io/plugin-kit/commit/53c17f5e9a5810dcae29e0d34a912e555a94706a))

## [1.1.0-ecosystem-preset.2](https://github.com/sanity-io/plugin-kit/compare/v1.1.0-ecosystem-preset.1...v1.1.0-ecosystem-preset.2) (2022-08-29)

### Features

- added inject command and support for --preset ([7d52ae1](https://github.com/sanity-io/plugin-kit/commit/7d52ae11ba14ff5c3cf56dca28a1c252e004c06f))

## [1.1.0-ecosystem-preset.1](https://github.com/sanity-io/plugin-kit/compare/v1.0.1...v1.1.0-ecosystem-preset.1) (2022-08-25)

### Features

- added --ecosystem-preset to init ([e513afe](https://github.com/sanity-io/plugin-kit/commit/e513afe4ea8caf62afb63285e73a5e987eafa8fe))

### Bug Fixes

- **deps:** update dependencies (non-major) ([#10](https://github.com/sanity-io/plugin-kit/issues/10)) ([25deacd](https://github.com/sanity-io/plugin-kit/commit/25deacdf8b2160222a1da31f88f10421b8d5fdd6))
- **deps:** update dependency get-latest-version to v4 ([86cbf08](https://github.com/sanity-io/plugin-kit/commit/86cbf0878553d0d8e1210aae935f0594395ade7b))
- **deps:** version bumps and updated dependent code ([d9cb8b0](https://github.com/sanity-io/plugin-kit/commit/d9cb8b0148d101ee1d2d33b9f9c590fbdba56a16))

## [1.0.1](https://github.com/sanity-io/plugin-kit/compare/v1.0.0...v1.0.1) (2022-08-24)

### Bug Fixes

- setup semantic-release ([e091626](https://github.com/sanity-io/plugin-kit/commit/e091626c859f950a91bdb8f17af282f47215ef35))
- use dev-preview tag as sanity peer dependency ([2b3e312](https://github.com/sanity-io/plugin-kit/commit/2b3e31204552cfca5e9c1cd258e5dd94bfc04b54))

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
