import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'legacy/**'],
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    name: 'boundary/engine',
    files: ['src/engine/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['vue', 'pinia', '@/stores/**', '@/ui/**', '@/services/**', '@/bridge/**', '@/app/**'],
              message: 'engine is framework-free: no Vue, Pinia, stores, ui, services, bridge, or app.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'boundary/domain',
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'vue',
                'pinia',
                'pixi.js',
                '@/engine/**',
                '@/services/**',
                '@/stores/**',
                '@/ui/**',
                '@/bridge/**',
                '@/app/**',
              ],
              message: 'domain is a pure island: no framework, engine, services, stores, ui, or bridge.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'boundary/services',
    files: ['src/services/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['vue', 'pinia', 'pixi.js', '@/engine/**', '@/stores/**', '@/ui/**', '@/bridge/**'],
              message: 'services must not depend on Vue, Pixi, engine, stores, ui, or bridge.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'boundary/stores',
    files: ['src/stores/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['pixi.js', '@/engine/**', '@/ui/**', '@/bridge/**'],
              message: 'stores must not depend on Pixi, engine, ui, or bridge.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'boundary/ui',
    files: ['src/ui/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['pixi.js', '@/engine/**', '@/app/**'],
              message: 'ui reaches the engine only through the bridge layer.',
            },
          ],
        },
      ],
    },
  },
  skipFormatting,
)
