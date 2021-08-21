module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'import', 'prefer-arrow'],
  env: {
    node: true,
  },
  rules: {
    // increasing error level from recommended preset
    '@typescript-eslint/no-unused-vars': 2,

    // typescript-eslint
    '@typescript-eslint/array-type': [1, { default: 'array-simple' }],
    '@typescript-eslint/naming-convention': [
      1,
      {
        selector: 'default',
        format: ['camelCase'],
      },
      {
        selector: 'variable',
        modifiers: ['const'],
        format: ['camelCase', 'UPPER_CASE'],
      },
      {
        selector: 'classProperty',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'classProperty',
        modifiers: ['readonly'],
        format: ['camelCase', 'UPPER_CASE'],
      },
      {
        selector: 'classProperty',
        modifiers: ['private', 'readonly'],
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'objectLiteralProperty',
        format: ['camelCase', 'UPPER_CASE'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
    '@typescript-eslint/no-confusing-non-null-assertion': 1,
    '@typescript-eslint/no-unnecessary-condition': 2,
    '@typescript-eslint/prefer-for-of': 1,
    '@typescript-eslint/prefer-includes': 1,
    '@typescript-eslint/prefer-literal-enum-member': 2,
    '@typescript-eslint/prefer-optional-chain': 1,
    '@typescript-eslint/prefer-readonly': 2,
    '@typescript-eslint/prefer-string-starts-ends-with': 1,
    '@typescript-eslint/promise-function-async': 1,
    '@typescript-eslint/switch-exhaustiveness-check': 2,

    // turn off eslint rules that have overrides
    'dot-notation': 0,
    'no-dupe-class-members': 0,
    'no-duplicate-imports': 0,
    'no-loss-of-precision': 0,
    'no-shadow': 0,
    'no-throw-literal': 0,
    'no-unused-expressions': 0,

    // extension rules
    '@typescript-eslint/dot-notation': 1,
    '@typescript-eslint/no-dupe-class-members': 1,
    '@typescript-eslint/no-duplicate-imports': 1,
    '@typescript-eslint/no-loss-of-precision': 2,
    '@typescript-eslint/no-shadow': 2,
    '@typescript-eslint/no-throw-literal': 2,
    '@typescript-eslint/no-unused-expressions': 2,

    // eslint
    curly: [1, 'multi-line'],
    'no-console': 1,
    eqeqeq: 2,
    'no-extend-native': 2,
    'no-multi-assign': 1,
    'no-sequences': 1,
    'no-useless-concat': 1,
    radix: 2,
    'spaced-comment': 1,
    yoda: 1,

    // import
    'import/no-absolute-path': 2,
    'import/no-deprecated': 1,
    'import/no-mutable-exports': 2,
    'import/first': 1,
    'import/order': [
      1,
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
        pathGroups: [
          {
            pattern: '@*/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: {
          order: 'asc',
        },
        'newlines-between': 'never',
      },
    ],
    'import/newline-after-import': 1,

    // prefer-arrow
    'prefer-arrow/prefer-arrow-functions': 2,
  },
}
