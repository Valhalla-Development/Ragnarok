module.exports = {
  env: {
    node: true,
    es2022: true
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['prettier'],
  rules: {
    quotes: ['error', 'single'],
    'max-classes-per-file': 'off',
    'no-console': 'off',
    'import/extensions': 'off',
    'class-methods-use-this': 'off',
    'import/no-named-as-default': 'off',
    'max-len': [
      'error',
      {
        ignoreComments: true,
        code: 150,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'no-use-before-define': ['error', { functions: false }],
    radix: 'off',
    'no-plusplus': 'off'
  }
};
