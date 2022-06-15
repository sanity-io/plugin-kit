module.exports = {
  env: {
    browser: true,
    node: false,
  },
  extends: ['plugin:prettier/recommended'],
  overrides: [
    {
      files: ['*.{ts,tsx}'],
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['prettier'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    'no-shadow': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'off',
    complexity: 'off',
    'id-length': 'off',
    'max-depth': 'off',
    'no-sync': 'off',
    strict: 'off',
  },

  settings: {
    ignorePatterns: ['test/fixtures/**'],
    'import/ignore': ['\\.css$', '.*node_modules.*', '.*:.*'],
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
}
