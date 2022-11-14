<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.9](https://github.com/sanity-io/plugin-kit/compare/v2.1.8...v2.1.9) (2022-11-14)

### Bug Fixes

- semver-workflow readme is now compatible with init ([95e8cba](https://github.com/sanity-io/plugin-kit/commit/95e8cba76582474271734f5e9259d9e5ce85acda))

## [2.1.8](https://github.com/sanity-io/plugin-kit/compare/v2.1.7...v2.1.8) (2022-11-07)

### Bug Fixes

- **deps:** sanity 3.0.0-rc.1 ([aa2d619](https://github.com/sanity-io/plugin-kit/commit/aa2d6196dd3c20e26bee0f3f5df125d3a8d9cba3))
- **deps:** sanity 3.0.0-rc.2 ([345eaa8](https://github.com/sanity-io/plugin-kit/commit/345eaa8808e6ee158cb10c25f73e3337be8fff81))

## [2.1.7](https://github.com/sanity-io/plugin-kit/compare/v2.1.6...v2.1.7) (2022-11-04)

### Bug Fixes

- workflow name based on inputs ([75c8932](https://github.com/sanity-io/plugin-kit/commit/75c89321c71025bf2de2c3911d58ad4b084c8dc3))

## [2.1.6](https://github.com/sanity-io/plugin-kit/compare/v2.1.5...v2.1.6) (2022-11-04)

### Bug Fixes

- package.json is now part of exports ([9e0631a](https://github.com/sanity-io/plugin-kit/commit/9e0631af37b7e1c87945d5ae9fc82775c8eebe4c))

## [2.1.5](https://github.com/sanity-io/plugin-kit/compare/v2.1.4...v2.1.5) (2022-11-04)

### Bug Fixes

- no longer includes tag in sanity devDependency range ([bd33294](https://github.com/sanity-io/plugin-kit/commit/bd33294b275f2fc9ca926cae6f998fea066e8ed7))

## [2.1.4](https://github.com/sanity-io/plugin-kit/compare/v2.1.3...v2.1.4) (2022-11-04)

### Bug Fixes

- test --if-present in workflow ([f243753](https://github.com/sanity-io/plugin-kit/commit/f24375375b3531f3b3c5aecfe2611fe19751b795))

## [2.1.3](https://github.com/sanity-io/plugin-kit/compare/v2.1.2...v2.1.3) (2022-11-04)

### Bug Fixes

- typo in workflow ([752eb16](https://github.com/sanity-io/plugin-kit/commit/752eb16fe3ea0a5b371aaafc6245d06e098ff899))

## [2.1.2](https://github.com/sanity-io/plugin-kit/compare/v2.1.1...v2.1.2) (2022-11-04)

### Bug Fixes

- removed duplicated release.needs in workflow ([9ba8356](https://github.com/sanity-io/plugin-kit/commit/9ba83560682190666287fc77654c194b8ef546c8))

## [2.1.1](https://github.com/sanity-io/plugin-kit/compare/v2.1.0...v2.1.1) (2022-11-04)

### Bug Fixes

- if the build step fails release should halt ([a1bb635](https://github.com/sanity-io/plugin-kit/commit/a1bb635b8c7622b67fcfb639bd22ae601e2fba06))

## [2.1.0](https://github.com/sanity-io/plugin-kit/compare/v2.0.9...v2.1.0) (2022-11-04)

### Features

- add `prettier-plugin-packagejson` ([937f4bc](https://github.com/sanity-io/plugin-kit/commit/937f4bce5f1e5fea3ad5482bca39641b1078b667))

### Bug Fixes

- `@sanity/ui@v1` is a prerelease and must be exact ([e8641b9](https://github.com/sanity-io/plugin-kit/commit/e8641b97a3ecd3ada07e649244ea5a359e27303b))
- node validation only checks for starts with >=14 now ([2a77c61](https://github.com/sanity-io/plugin-kit/commit/2a77c61c3669c766dc8c7573ffe9ab4f3b5a2541))
- only peer deps should use `||` semver ranges ([9869feb](https://github.com/sanity-io/plugin-kit/commit/9869febd0e32324c356003cca2cefeb14bad40f6))
- polyfill `String.replaceAll` for Node v14 ([33e4deb](https://github.com/sanity-io/plugin-kit/commit/33e4debe0346c94694a64f6d1ac02858851ea34b))
- remove purple-unicorn references ([34c745a](https://github.com/sanity-io/plugin-kit/commit/34c745a1bf63edd0ea5f3098e7d0cf84efb4dfca))
- replaceAll -> replace ([e2f574c](https://github.com/sanity-io/plugin-kit/commit/e2f574c1286c2d5b400a89f864d781f2c3f26726))
- shorter version numbers are better ([b860b9c](https://github.com/sanity-io/plugin-kit/commit/b860b9c5c0000fdef22df0427247d91c45ba414b))
- update semver `main.yaml` template ([82d72e6](https://github.com/sanity-io/plugin-kit/commit/82d72e6cb4270ffa015d2a844448a6c58ca7771e))
- use `.prettierrc.json` instead of `.js` ([39a2a52](https://github.com/sanity-io/plugin-kit/commit/39a2a5251d8a807803a79b257e465767b2802939))
- use latest `@sanity/ui` exact version ([c5e8643](https://github.com/sanity-io/plugin-kit/commit/c5e8643d3420d5df0c6696dfb24e7d7d2c1ac1af))
- use main as default branch in workflow and releaserc ([4d06bb3](https://github.com/sanity-io/plugin-kit/commit/4d06bb3f91c7b7f323d90bb60883ab0c8686cc52))

## [2.0.9](https://github.com/sanity-io/plugin-kit/compare/v2.0.8...v2.0.9) (2022-11-03)

### Bug Fixes

- also link-watch ts files by default ([07f07fc](https://github.com/sanity-io/plugin-kit/commit/07f07fc3d3e166bceb1219adb08beda31a8d72fe))

## [2.0.8](https://github.com/sanity-io/plugin-kit/compare/v2.0.7...v2.0.8) (2022-11-03)

### Bug Fixes

- **deps:** update dependencies (non-major) ([#27](https://github.com/sanity-io/plugin-kit/issues/27)) ([6753319](https://github.com/sanity-io/plugin-kit/commit/6753319d7f27dfd29b6d7158cd5e421ee5c4ce84))
- npmignore not needed as we use `pkg.files` ([28a085d](https://github.com/sanity-io/plugin-kit/commit/28a085da8fba960915473c9cce556eb1d2efddbf))

## [2.0.7](https://github.com/sanity-io/plugin-kit/compare/v2.0.6...v2.0.7) (2022-11-02)

### Bug Fixes

- added parcel to deprecated dependencies check ([6172dcb](https://github.com/sanity-io/plugin-kit/commit/6172dcb1c8c96ec8c8d87246bd5998fc4b9ba246))

## [2.0.6](https://github.com/sanity-io/plugin-kit/compare/v2.0.5...v2.0.6) (2022-11-02)

### Bug Fixes

- added yalc files to gitignore template ([1442bbd](https://github.com/sanity-io/plugin-kit/commit/1442bbd09458f61e669a48f41c38270d94abb79b))

## [2.0.5](https://github.com/sanity-io/plugin-kit/compare/v2.0.4...v2.0.5) (2022-11-02)

### Bug Fixes

- require index.js or index.ts as entrypoint for the plugin ([7c25507](https://github.com/sanity-io/plugin-kit/commit/7c25507a105a6e362355d283e67e8726628a6e96))

## [2.0.4](https://github.com/sanity-io/plugin-kit/compare/v2.0.3...v2.0.4) (2022-11-02)

### Bug Fixes

- use .esm.js for default ([4b63b88](https://github.com/sanity-io/plugin-kit/commit/4b63b8813cc931242295e2b74648002c4a58a8a5))

## [2.0.3](https://github.com/sanity-io/plugin-kit/compare/v2.0.2...v2.0.3) (2022-11-02)

### Bug Fixes

- added package.config.ts to eslintignore ([2d20f01](https://github.com/sanity-io/plugin-kit/commit/2d20f018e63f6e309b779d02b7fb8b0b42c372b2))

## [2.0.2](https://github.com/sanity-io/plugin-kit/compare/v2.0.1...v2.0.2) (2022-11-02)

### Bug Fixes

- now uses defineConfig and definePlugin in templates ([a678d6d](https://github.com/sanity-io/plugin-kit/commit/a678d6d63c0d9ae89d60e4a2f49b404209258cd1))

## [2.0.1](https://github.com/sanity-io/plugin-kit/compare/v2.0.0...v2.0.1) (2022-11-02)

### Bug Fixes

- pins sanity to dev-preview || 3.0.0-rc.0 ([cb46dd9](https://github.com/sanity-io/plugin-kit/commit/cb46dd9236d8b735243e5da0ddd363e4e526fe10))

## [2.0.0](https://github.com/sanity-io/plugin-kit/compare/v1.1.0...v2.0.0) (2022-11-02)

### ⚠ BREAKING CHANGES

- @sanity/pkg-utils is now the recommended build tool for Sanity plugins

### Features

- replaced parcel with @sanity/pkg-utils for builds ([7cd554f](https://github.com/sanity-io/plugin-kit/commit/7cd554f9c4044ff0a94cee37f8d5d5e3da19875c))

### Bug Fixes

- use jsx suffix if source already has it ([3f1a266](https://github.com/sanity-io/plugin-kit/commit/3f1a266a5b36500dbcaaa887952e7bce3b87e8a6))

## [1.1.0](https://github.com/sanity-io/plugin-kit/compare/v1.0.2...v1.1.0) (2022-10-31)

### Features

- added --ecosystem-preset to init ([219561b](https://github.com/sanity-io/plugin-kit/commit/219561bc90d29d4babd331588ce16ca6d9b9bdd2))
- added inject command and support for --preset ([b5f5377](https://github.com/sanity-io/plugin-kit/commit/b5f53777f16591f083956ac272c33d619ad1eb65))
- build related package.json entries are overridden instead of retained ([deb87b0](https://github.com/sanity-io/plugin-kit/commit/deb87b04a3730d5f0eefa4896b3d5465b62b505d))
- force package versions and made stricter verifications ([9d030fb](https://github.com/sanity-io/plugin-kit/commit/9d030fb064368c6ffa21958288cd5bd94f97229d))
- inject adds the same dependencies as init now ([dd30373](https://github.com/sanity-io/plugin-kit/commit/dd30373a3f0d0b41c37d9272cb08f202d66812ad))
- preset semantic-release now updates README.md when it exists (naively) ([0a33a25](https://github.com/sanity-io/plugin-kit/commit/0a33a254fc137e8f3b2db0234594e725b432cfd3))
- semver-workflow now injects .npmrc with legacy-peer-deps=true ([7c53c7a](https://github.com/sanity-io/plugin-kit/commit/7c53c7a7edabbe1f219cdeb5438475099acaceb6))

### Bug Fixes

- add missing lint-staged config ([071a01d](https://github.com/sanity-io/plugin-kit/commit/071a01db169d08ae89241af29c7653fb5f1c6569))
- added --dry-run flag to release job for safety ([c09c4f3](https://github.com/sanity-io/plugin-kit/commit/c09c4f32282d2eaabf503ac89918b6071dd5c719))
- forced dependencies now works correctly ([9b520f7](https://github.com/sanity-io/plugin-kit/commit/9b520f72f9715e61e5f4b8d231137fdeb4b392eb))
- imports in studio config example ([a6a5b2e](https://github.com/sanity-io/plugin-kit/commit/a6a5b2ed47f9090354c145b17ae3e32ec0e1347b))
- readme newlines ([8be3aca](https://github.com/sanity-io/plugin-kit/commit/8be3acace8af5c91f1ba6b0d6d23166b1200db8c))
- **semantic-workflow:** filter out README sections that exists "close enough" ([04a8b8a](https://github.com/sanity-io/plugin-kit/commit/04a8b8a63a09ec3a3398b7c1e61c609dafb45568))
- **semantic-workflow:** npmrc bundling ([31c0e77](https://github.com/sanity-io/plugin-kit/commit/31c0e775ad86b27e8c1ca777d983265feecca755))
- show note about manual config steps in semver-workflow ([f36fc55](https://github.com/sanity-io/plugin-kit/commit/f36fc55585fb8f2cba6a157ba0a482f4cef2fcc9))
- url readme url ([c8730da](https://github.com/sanity-io/plugin-kit/commit/c8730da4e65b96a30b1e7d77dd9079c29b272d47))
- use correct @sanity/ui package name ([1f224a9](https://github.com/sanity-io/plugin-kit/commit/1f224a94e65e0a77fbf9d1e2e2abd201ea16914a))

## [1.0.2](https://github.com/sanity-io/plugin-kit/compare/v1.0.1...v1.0.2) (2022-09-27)

### Bug Fixes

- **deps:** update dependencies (non-major) ([#10](https://github.com/sanity-io/plugin-kit/issues/10)) ([25deacd](https://github.com/sanity-io/plugin-kit/commit/25deacdf8b2160222a1da31f88f10421b8d5fdd6))
- **deps:** update dependency get-latest-version to v4 ([86cbf08](https://github.com/sanity-io/plugin-kit/commit/86cbf0878553d0d8e1210aae935f0594395ade7b))
- **deps:** version bumps and updated dependent code ([d9cb8b0](https://github.com/sanity-io/plugin-kit/commit/d9cb8b0148d101ee1d2d33b9f9c590fbdba56a16))
- verify-studio config file detection support for tsx and jsx ([73e27bc](https://github.com/sanity-io/plugin-kit/commit/73e27bc0dbc84153b2067d4c5a67f897d2e6b886))

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
