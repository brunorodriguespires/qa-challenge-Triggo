import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  // Testes independentes: podem rodar em paralelo dentro de cada arquivo
  fullyParallel: true,
  // Impede que um test.only esquecido chegue à pipeline
  forbidOnly: isCI,
  // Retry só no CI, para não mascarar flakiness durante o desenvolvimento
  retries: isCI ? 1 : 0,
  // Paralelismo limitado (o enunciado proíbe execução excessivamente paralela)
  workers: 2,

  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://playwrightlab.github.io',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    // Evidências só quando há falha: diagnóstico completo sem pesar nas execuções aprovadas
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Atributo confirmado no site. Os testes preferem role/label; data-testid cobre o que não tem nome acessível
    testIdAttribute: 'data-testid',
  },

  // A cobertura por navegador é escolhida por tag no próprio teste, de acordo com o risco
  // (justificativa na seção 8 de docs/estrategia-de-testes.md)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Segundo navegador: apenas smoke e fluxos de maior risco (tag @cross)
      name: 'firefox',
      // Nesta página, o Firefox tem travamentos intermitentes de vários segundos em ações comuns
      // (clique, teclado, navegação), sem falha funcional. A causa raiz não foi determinada.
      timeout: 60_000,
      use: { ...devices['Desktop Firefox'], actionTimeout: 25_000 },
      grep: /@smoke|@cross/,
    },
    {
      // Pixel 7: 412x915, abaixo do breakpoint de 480px do site
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      grep: /@mobile/,
    },
  ],

  outputDir: 'test-results',
});