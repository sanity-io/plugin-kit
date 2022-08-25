import {FromTo} from '../actions/splat'
import {resolveLatestVersions} from '../npm/resolveLatestVersions'

export function ecosystemPresetFiles(): FromTo[] {
  return [
    {
      from: ['ecosystem', '.github', 'workflows', 'main.yml'],
      to: ['.github', 'workflows', 'main.yml'],
    },
    {
      from: ['ecosystem', '.husky', 'commit-msg'],
      to: ['.husky', 'commit-msg'],
    },
    {
      from: ['ecosystem', '.husky', 'pre-commit'],
      to: ['.husky', 'pre-commit'],
    },
    {from: ['ecosystem', '.releaserc.json'], to: '.releaserc.json'},
    {from: ['ecosystem', 'commitlint.config.js'], to: 'commitlint.config.js'},
    {from: ['ecosystem', 'renovate.json'], to: 'renovate.json'},
  ]
}

export async function ecosystemDevDependencies(): Promise<Record<string, string>> {
  return resolveLatestVersions([
    '@commitlint/cli',
    '@commitlint/config-conventional',
    '@sanity/semantic-release-preset',
    'husky',
    'lint-staged',
  ])
}
