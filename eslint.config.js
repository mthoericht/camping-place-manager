import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules', '**/node_modules/**', '**/dist/**', 'data/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      'brace-style': ['error', 'allman', { allowSingleLine: true }],
      'indent': ['error', 2, {
        SwitchCase: 1,
        ignoredNodes: [
          'TSTypeParameterInstantiation',
          'TSTypeParameterDeclaration'
        ]
      }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
];
