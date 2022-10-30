import tap from 'tap'
import {readmeBaseurl} from '../src/presets/semver-workflow'
import {PackageJson} from '../src/actions/verify/types'

tap.test('readmeBaseUrl', async (t) => {
  const testCases: {pkg: PackageJson; expectedUrl: string}[] = [
    {
      pkg: {repository: {url: 'git+https://github.com/sanity-io/sanity.git'}},
      expectedUrl: 'https://github.com/sanity-io/sanity',
    },
    {
      pkg: {repository: {url: 'git+ssh://git@github.com/sanity-io/plugin-kit.git'}},
      expectedUrl: 'https://github.com/sanity-io/plugin-kit',
    },
    {
      pkg: {repository: {url: 'git@github.com:sanity-io/sanity-plugin-cloudinary.git'}},
      expectedUrl: 'https://github.com/sanity-io/sanity-plugin-cloudinary',
    },
    {
      pkg: {repository: {url: 'git+https://github.com/sanity-io/sanity-plugin.git'}},
      expectedUrl: 'https://github.com/sanity-io/sanity-plugin',
    },
    {
      pkg: {homepage: 'https://github.com/sanity-io/plugin-with-readme#readme'},
      expectedUrl: 'https://github.com/sanity-io/plugin-with-readme',
    },
  ]

  testCases.forEach(({pkg, expectedUrl}) => t.equal(readmeBaseurl(pkg), expectedUrl))
})
