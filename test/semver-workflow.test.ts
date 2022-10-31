import tap from 'tap'
import {missingSections, readmeBaseurl} from '../src/presets/semver-workflow'
import {PackageJson} from '../src/actions/verify/types'
import outdent from 'outdent'

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

tap.test('missingSections', async (t) => {
  const exactMatch = outdent`
  This a
  matches b
  exactly c
`
  const over50PercentMatch = outdent`
  This x
  matches y
  enough z
`
  const only50PercentMatch = outdent`
  This
  does
  not
  match
`
  const sections = [exactMatch, over50PercentMatch, only50PercentMatch]

  const readme = outdent`
    This a
    matches b
    exactly c

    This x
    matches y
    enough zzzzzz

    This
    does
    miss
  `

  const missing = missingSections(readme, sections)
  t.same(missing, [only50PercentMatch])
})
