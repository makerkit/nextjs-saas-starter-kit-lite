import eslint from '@eslint/js';
import turboConfig from 'eslint-config-turbo/flat';
import tsEsLint from 'typescript-eslint';

import nextConfig from './nextjs.js';

export default tsEsLint.config(
  eslint.configs.recommended,
  nextConfig,
  turboConfig,
  {
    settings: {
      react: {
        version: '19.0',
      },
    },
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'import/no-anonymous-default-export': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-unresolved': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'import/no-cycle': 'off',
      'import/no-unused-modules': 'off',
      'import/no-deprecated': 'off',
      'turbo/no-undeclared-env-vars': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-i18next',
              importNames: ['Trans'],
              message: 'Please use `@kit/ui/trans` instead',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      '**/node_modules',
      '**/database.types.ts',
      '**/.next',
      '**/public',
      'dist',
      'pnpm-lock.yaml',
    ],
  },
);
