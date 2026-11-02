import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@fixtures/base';
import { RegistrationFormPage } from '@pages/registration-form.page';

// Rastreabilidade com docs/matriz-de-cenarios.md e docs/matriz-de-riscos.md
// T07: A11Y-01 (parcial), A11Y-02, A11Y-06, A11Y-07, FRM-07 | riscos RA-01, RA-02, RA-04, RA-05
// O axe cobre só parte da WCAG; o foco é testado à parte porque ele não detecta esse comportamento (ver README).

// Defeitos do site, sem correção possível por aqui e detalhados no README. Ficam visíveis no relatório;
// o teste falha se aparecer uma regra nova. A lista é por regra: um novo elemento em regra conhecida não falha.
const VIOLACOES_CONHECIDAS = ['button-name', 'color-contrast', 'label', 'select-name'];

test.describe('Acessibilidade', () => {
  test(
    'T07 - axe, labels do formulário e armadilha de foco',
    { tag: ['@a11y'] },
    async ({ focusTrap, page }) => {
      // Instanciado aqui porque a fixture registrationForm abriria a página uma segunda vez
      const form = new RegistrationFormPage(page);

      await test.step('axe: seções-alvo sem violações WCAG A/AA além das já conhecidas', async () => {
        const { violations } = await new AxeBuilder({ page })
          .include('[data-testid="registration-form"]')
          .include('[data-testid="table-card"]')
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        await test.info().attach('axe-violacoes.json', {
          body: JSON.stringify(violations, null, 2),
          contentType: 'application/json',
        });
        for (const v of violations.filter((v) => VIOLACOES_CONHECIDAS.includes(v.id))) {
          test.info().annotations.push({ type: 'a11y-conhecida', description: `${v.id} (${v.impact}): ${v.nodes.length} elemento(s)` });
        }

        const novas = violations.filter((v) => !VIOLACOES_CONHECIDAS.includes(v.id)).map((v) => v.id);
        expect(novas, 'regras violadas fora da lista de conhecidas').toEqual([]);
      });

      await test.step('labels: campos do formulário têm nome acessível', async () => {
        for (const campo of [form.fullName, form.email, form.password, form.phone, form.dob, form.country, form.bio]) {
          await expect(campo).toBeVisible();
          await expect(campo).toHaveAccessibleName(/.+/);
        }
      });

      await test.step('foco: abrir a área move o foco para dentro dela', async () => {
        await focusTrap.openButton.click();
        await expect(focusTrap.area).toBeVisible();
        await expect(focusTrap.input).toBeFocused();
      });

      await test.step('foco: Tab e Shift+Tab circulam só dentro da área', async () => {
        await page.keyboard.press('Tab');
        await expect(focusTrap.actionButton).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(focusTrap.closeButton).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(focusTrap.input).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(focusTrap.closeButton).toBeFocused();
      });

      await test.step('foco: Escape fecha a área e devolve o foco ao acionador', async () => {
        await page.keyboard.press('Escape');
        await expect(focusTrap.area).toBeHidden();
        await expect(focusTrap.openButton).toBeFocused();
      });
    },
  );
});
