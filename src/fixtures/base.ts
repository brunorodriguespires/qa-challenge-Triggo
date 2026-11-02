import { test as base, expect, type Page } from '@playwright/test';
import { UsersTablePage } from '@pages/users-table.page';
import { RegistrationFormPage } from '@pages/registration-form.page';
import { DelayedDropdownPage } from '@pages/delayed-dropdown.page';
import { FocusTrapPage } from '@pages/focus-trap.page';

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

/** Prepara a página: dispensa o banner, bloqueia recursos de terceiros e abre a aplicação. */
async function openApp(page: Page, baseURL: string | undefined): Promise<void> {
  // Terceiros (analytics, imagens, iframe externo) não interessam ao teste, atrasam o carregamento
  // e não devem receber tráfego da suíte.
  const origemDaApp = new URL(baseURL!).origin;
  await page.route(
    (url) => url.origin !== origemDaApp,
    (route) => route.abort(),
  );
  await registerCookieBannerHandler(page);
  // O script do site é "defer" e já rodou neste ponto. Esperar o "load" chegou a estourar o tempo no Firefox.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

/**
 * Cada fixture entrega o Page Object com a página pronta. Assim, o teste descreve só o comportamento,
 * e o preparo fica em um único lugar. Cada teste recebe contexto próprio, sem dependência de ordem.
 */
type Fixtures = {
  usersTable: UsersTablePage;
  registrationForm: RegistrationFormPage;
  delayedDropdown: DelayedDropdownPage;
  focusTrap: FocusTrapPage;
  /**
   * Registra erros de JavaScript da página como anotação do teste (não falha o teste).
   * Decisão: a página tem dezenas de seções, e um erro em seção alheia não deve reprovar o teste,
   * mas fica visível no relatório (risco RX-02).
   */
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

  usersTable: async ({ page, baseURL }, use) => {
    await openApp(page, baseURL);
    const usersTable = new UsersTablePage(page);
    await usersTable.card.scrollIntoViewIfNeeded();
    await use(usersTable);
  },

  registrationForm: async ({ page, baseURL }, use) => {
    await openApp(page, baseURL);
    const registrationForm = new RegistrationFormPage(page);
    await registrationForm.form.scrollIntoViewIfNeeded();
    await use(registrationForm);
  },

  delayedDropdown: async ({ page, baseURL }, use) => {
    await openApp(page, baseURL);
    const delayedDropdown = new DelayedDropdownPage(page);
    await delayedDropdown.card.scrollIntoViewIfNeeded();
    await use(delayedDropdown);
  },

  focusTrap: async ({ page, baseURL }, use) => {
    await openApp(page, baseURL);
    const focusTrap = new FocusTrapPage(page);
    await focusTrap.openButton.scrollIntoViewIfNeeded();
    await use(focusTrap);
  },
});

export { expect };
