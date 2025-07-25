// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', 'migrations/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.all,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/parameter-properties': 'off',
      '@typescript-eslint/naming-convention': ['error', {
        selector: 'default',
        format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      }],
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/class-methods-use-this': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/no-redeclare': ['error', { 
        ignoreDeclarationMerge: true,
        builtinGlobals: false 
      }],
    },
  },
);
