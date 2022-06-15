export default {
  init: require.resolve('./init'),
  'link-watch': require.resolve('./link-watch'),
  'verify-package': require.resolve('./verify-package'),
  'verify-studio': require.resolve('./verify-studio'),
  version: require.resolve('./version'),
  // wont make it for initial release
  //splat: require.resolve('./splat'),
}
