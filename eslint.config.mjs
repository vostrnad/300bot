/* eslint-disable @typescript-eslint/naming-convention */
import eslintConfigJest from '@vostrnad/eslint-config-jest'
import eslintConfigNode from '@vostrnad/eslint-config-node'
import eslintConfigTypescript from '@vostrnad/eslint-config-typescript'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...eslintConfigTypescript,
  eslintConfigNode,
  eslintConfigJest,
  {
    ignores: ['node_modules', 'dist', 'jest.config.js'],
  },
  {
    settings: {
      'import/internal-regex':
        '^@(app|commands|database|discord|planetside|test)\\/',
    },
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        1,
        {
          patterns: [
            {
              group: ['@app/modules/*'],
              message:
                'Unnecessary path prefix, please import using the module alias.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 0,
    },
  },
])
