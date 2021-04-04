const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  parserOptions: {
    include: ['src/**/*.ts'],
    exclude: ['public/*', 'src/**/*.d.ts'],
  },
  settings: {
    'import/extensions': ['.js', '.ts', '.d.ts'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/consistent-type-assertions': 0,
    '@typescript-eslint/no-angle-bracket-type-assertion': 0,
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/indent': ['error', 2],
    'no-param-reassign': 0,
    'max-classes-per-file': 0,
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'jsx-a11y/label-has-associated-control': 0,
    'import/no-cycle': 0,
    camelcase: 0,
    'max-len': ['error', {
      code: 120,
    }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    'no-use-before-define': ['error', { functions: false, classes: true }],
    '@typescript-eslint/no-shadow': 'error',
    'no-shadow': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
  },
  ignorePatterns: ['node_modules', 'dist', '*.config.js', '*.config.cjs'],
};
