module.exports = [
  {
    ignores: ['coverage/**', 'src/generated/**'],
  },
  {
    files: ['src/**/*.js'],
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      eqeqeq: 'error',
      'no-console': ['warn', { allow: ['log', 'error'] }],
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
];
