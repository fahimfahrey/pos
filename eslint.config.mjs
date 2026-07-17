import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import boundaries from 'eslint-plugin-boundaries'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

const STORAGE_ENGINES = ['dexie','idb','idb-keyval','localforage','fake-indexeddb','better-sqlite3','sql.js','@sqlite.org/sqlite-wasm']

export default [
  js.configs.recommended,
  {
    ignores: ['.next/**','node_modules/**','coverage/**','playwright-report/**','test-results/**','**/__boundary_fixtures__/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/**/__boundary_fixtures__/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['e2e/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', '*.config.{ts,mts,mjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    plugins: { boundaries },
    files: ['src/**'],
    settings: {
      'boundaries/include': ['src/app/**','src/domains/**','src/infrastructure/**','src/shared/**','src/constants/**'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'actions', pattern: 'src/domains/*/actions/**' },
        { type: 'services', pattern: 'src/domains/*/services/**' },
        { type: 'repositories', pattern: 'src/domains/*/repositories/**' },
        { type: 'repositories', pattern: 'src/domains/*/repository.ts' },
        { type: 'entities', pattern: 'src/domains/*/entities/**' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**' },
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'constants', pattern: 'src/constants/**' },
      ],
      'import/resolver': { typescript: { alwaysTryTypes: true } },
    },
    rules: {
      'boundaries/no-unknown': 'error',
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: ['app'], allow: ['app','actions','shared','constants'] },
          { from: ['actions'], allow: ['actions','services','entities','infrastructure','shared','constants'] },
          { from: ['services'], allow: ['services','repositories','entities','shared','constants'] },
          { from: ['repositories'], allow: ['repositories','entities','shared','constants'] },
          { from: ['entities'], allow: ['entities','shared','constants'] },
          { from: ['infrastructure'], allow: ['infrastructure','services','repositories','entities','shared','constants'] },
          { from: ['shared'], allow: ['shared','constants'] },
          { from: ['constants'], allow: ['constants'] },
        ],
      }],
      'boundaries/external': ['error', {
        default: 'allow',
        rules: [{
          from: ['app','actions','services','repositories','entities','shared','constants'],
          disallow: STORAGE_ENGINES,
          message: "Storage engine '${dependency}' may only be imported from src/infrastructure.",
        }],
      }],
      'no-restricted-globals': ['error',
        { name: 'indexedDB', message: 'Use a repository via infrastructure; do not touch indexedDB directly.' },
      ],
    },
  },
  { // infrastructure may use the storage globals
    files: ['src/infrastructure/**'],
    rules: { 'no-restricted-globals': 'off' },
  },
  { // tests, e2e, config are exempt from boundary rules
    files: ['**/*.test.{ts,tsx}','**/*.spec.{ts,tsx}','e2e/**','vitest.setup.ts','*.config.{ts,mts,mjs}'],
    rules: { 'boundaries/element-types':'off','boundaries/external':'off','boundaries/no-unknown':'off','no-restricted-globals':'off' },
  },
  prettier,
]
