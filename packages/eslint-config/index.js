const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/typescript',
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  rules: {
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
  },
  ignorePatterns: ['node_modules/', 'dist/'],
  overrides: [
    {
      files: ['*.config.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
}
