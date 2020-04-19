module.exports = {
  extends: ['sanity', 'sanity/react', 'prettier', 'prettier/react'],
  env: {node: true, browser: true},
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
}
