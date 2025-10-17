import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
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
      'import/ignore': ['\\.css$', '.*node_modules.*', '.*:.*'],
      'import/resolver': {
        node: {
          paths: ['src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-shadow': 'off',
      'no-await-in-loop': 'off',
      'no-console': 'off',
      complexity: 'off',
      'id-length': 'off',
      'max-depth': 'off',
      'no-sync': 'off',
      strict: 'off',
    },
  },
  {
    ignores: ['test/fixtures/**', 'dist/**', 'node_modules/**', 'assets/**'],
  },
]