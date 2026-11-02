import { test, expect } from '@fixtures/base';
import { buildNewUser } from '@data/user';

// Rastreabilidade com docs/matriz-de-cenarios.md e docs/matriz-de-riscos.md
// T08: USR-08, RSP-01, RSP-02, RSP-04, RSP-05 | riscos RF-11, RU-01, RU-02
// O mesmo teste roda nos projetos chromium e mobile: cumpre o requisito mobile com cliques reais, sem duplicar código.
test.describe('Adicionar usuário', () => {
  test(
    'T08 - adicionar usuário pelo modal e localizá-lo na tabela, sem overflow horizontal',
    { tag: ['@users', '@mobile'] },
    async ({ usersTable, page }) => {
      const novo = buildNewUser();

      await test.step('as ações principais ficam visíveis', async () => {
        await usersTable.waitForData();
        await expect(usersTable.search).toBeVisible();
        await expect(usersTable.nextPage).toBeVisible();
        await expect(usersTable.addUserButton).toBeVisible();
      });

      // Total lido em tempo de execução: o teste valida o incremento, não uma quantidade fixa de registros
      const total = await usersTable.totalEntries();

      await test.step('o modal adiciona o usuário e atualiza o total', async () => {
        await usersTable.addUser(novo);
        await expect(usersTable.modal).toBeHidden();
        await expect(usersTable.entriesInfo).toHaveText(new RegExp(`of ${total + 1} entries`));
      });

      await test.step('a busca encontra o usuário criado com os dados informados', async () => {
        await usersTable.searchFor(novo.name);
        await expect(usersTable.rows).toHaveCount(1);
        expect(await usersTable.columnValues('Name')).toEqual([novo.name]);
        expect(await usersTable.columnValues('Email')).toEqual([novo.email]);
        expect((await usersTable.columnValues('Role'))[0].toLowerCase()).toBe(novo.role.toLowerCase());
      });

      await test.step('a página não tem scroll horizontal', async () => {
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
      });
    },
  );
});
