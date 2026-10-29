import { test as base, expect, type Page } from '@playwright/test';
import { UsersTablePage } from '@pages/users-table.page';

/**
 * O banner de cookies (data-testid="cookie-banner") é fixo no rodapé e pode cobrir controles.
 * Ele nem sempre aparece (ex.: não surge no Playwright Inspector), então NÃO esperamos por ele
 * com um tempo fixo. Usamos addLocatorHandler: se o banner estiver visível quando uma ação
 * precisar de um elemento, o handler o dispensa e a ação é repetida automaticamente.
 */
async function registerCookieBannerHandler(page: Page): Promise<void> {
  await page.addLocatorHandler(page.getByTestId('cookie-banner'), async () => {
    await page.getByTestId('cookie-reject').click();
  });
}

type Fixtures = {
  usersTable: UsersTablePage;
  /** Registra erros de JavaScript da página como anotação do teste (não falha o teste). */
  pageErrors: string[];
};

export const test = base.extend<Fixtures>({
  pageErrors: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await use(errors);
      for (const message of errors) {
        testInfo.annotations.push({ type: 'pageerror', description: message });
      }
    },
    { auto: true },
  ],

  usersTable: async ({ page }, use) => {
    // Imagens de terceiros (Unsplash) não interessam ao teste e adicionam ruído de rede.
    await page.route('https://images.unsplash.com/**', (route) => route.abort());

    await registerCookieBannerHandler(page);
    await page.goto('/');

    const usersTable = new UsersTablePage(page);
    await usersTable.card.scrollIntoViewIfNeeded();
    await use(usersTable);
  },
});

export { expect };