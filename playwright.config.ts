import { defineConfig } from '@playwright/test'

const explicitBase = process.env.BASE_URL
const chrome = process.env.CHROME_PATH
export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  timeout: 45_000,
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: explicitBase ?? 'http://127.0.0.1:4173/',
    launchOptions: chrome ? { executablePath: chrome } : undefined,
    trace: 'retain-on-failure',
  },
  webServer: explicitBase ? undefined : {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: true,
  },
})
