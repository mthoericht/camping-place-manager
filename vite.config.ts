/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@shared': path.resolve(dirname, './shared')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }]
          },
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      },
      {
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src'),
            '@shared': path.resolve(dirname, './shared')
          }
        },
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['test/unit/**/*.test.{ts,tsx}'],
          setupFiles: ['vitest.setup.unit.ts'],
          globals: true
        }
      },
      {
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src'),
            '@shared': path.resolve(dirname, './shared')
          }
        },
        test: {
          name: 'integration',
          environment: 'node',
          include: ['test/integration/**/*.integration.test.ts'],
          setupFiles: ['vitest.setup.integration.ts'],
          globals: true,
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } }
        }
      }
    ]
  }
});