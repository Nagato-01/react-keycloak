module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-hooks'
  ],
  rules: {
    // Règles de base - pas trop strictes pour un projet de présentation
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    // Règles React
    'react/react-in-jsx-scope': 'off', // React 17+ n'a plus besoin d'importer React
    'react/prop-types': 'off', // Désactivé pour simplifier
    'react/display-name': 'off',
    // Règles de style simples
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'always'],
    'indent': ['warn', 2],
    'comma-dangle': ['warn', 'never'],
    'no-trailing-spaces': 'warn',
    'eol-last': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};