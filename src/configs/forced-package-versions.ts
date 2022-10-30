export const forcedPackageVersions = {
  react: '^18.0.0',
  '@types/react': '^18.0.0',
  'react-dom': '^18.0.0',
  '@types/react-dom': '^18.0.0',
  sanity: 'dev-preview || 3.0.0-dev-preview.22',
  'sanity-ui': '^1.0.0-beta.31',

  //TODO delete both of these when we ditch parcel
  parcel: '~2.6.0',
  typescript: '~4.7.0',
} as const
