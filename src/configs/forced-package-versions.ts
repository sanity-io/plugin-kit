const sanityVersion = '3.0.0-rc.1'

export const forcedPackageVersions = {
  react: '^18',
  '@types/react': '^18',
  'react-dom': '^18',
  '@types/react-dom': '^18',
  sanity: `dev-preview || ${sanityVersion}`,
  '@sanity/ui': '1.0.0-beta.32',
}

export const forcedDevPackageVersions = {
  ...forcedPackageVersions,
  // tagged release does not play nice with npm ci
  sanity: sanityVersion,
}
