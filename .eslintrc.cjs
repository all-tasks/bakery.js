module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: 'airbnb-base',
  globals: {
    bun: true,
    'bun:test': true,
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': 'off',
    'import/no-unresolved': [2, { ignore: ['^#.+$', '^bun.*$'] }],
    'import/prefer-default-export': 'off',
    'no-console': ['warn', { allow: ['debug', 'info', 'warn', 'error'] }],
  },
};
