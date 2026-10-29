import { test, expect } from '@fixtures/base';
import { COLUNAS_ESPERADAS } from '@pages/users-table.page';

// O DOM guarda o perfil em minúsculas ("admin"); a capitalização visual vem de CSS.
const PERFIS_VALIDOS = ['admin', 'editor', 'viewer'];
const STATUS_VALIDOS = ['active', 'inactive', 'pending'];

test.describe('Gerenciamento de usuários', () => {
  test(
    'T01 - tabela carrega com cabeçalhos, dados e perfis válidos',
    { tag: ['@smoke', '@users', '@cross'] },
    async ({ usersTable }) => {
      await test.step('a tabela é exibida com a primeira página de dados', async () => {
        await expect(usersTable.table).toBeVisible();
        await usersTable.waitForData();
        await expect(usersTable.rows).toHaveCount(5); // tamanho de página padrão: 5 por página
        await expect(usersTable.entriesInfo).toHaveText(/Showing 1-5 of \d+ entries/);
      });

      await test.step('todos os cabeçalhos esperados existem', async () => {
        for (const coluna of COLUNAS_ESPERADAS) {
          await expect(usersTable.headerByName(coluna), `cabeçalho "${coluna}"`).toHaveCount(1);
        }
      });

      await test.step('cada linha tem ID, nome e e-mail válidos', async () => {
        const ids = await usersTable.columnValues('ID');
        const nomes = await usersTable.columnValues('Name');
        const emails = await usersTable.columnValues('Email');

        expect(new Set(ids).size, 'IDs devem ser únicos').toBe(ids.length);
        for (const nome of nomes) expect(nome).not.toBe('');
        for (const email of emails) expect(email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
      });

      await test.step('perfis e status pertencem ao domínio esperado', async () => {
        const perfis = await usersTable.columnValues('Role');
        for (const perfil of perfis) expect(PERFIS_VALIDOS).toContain(perfil.toLowerCase());

        const status = await usersTable.columnValues('Status');
        for (const s of status) expect(STATUS_VALIDOS).toContain(s.toLowerCase());
      });
    },
  );

  test(
    'T02 - busca localiza usuário existente e trata usuário inexistente',
    { tag: ['@users', '@negative', '@cross'] },
    async ({ usersTable }) => {
      await usersTable.waitForData();
      const [nomeExistente] = await usersTable.columnValues('Name');

      await test.step('busca por um usuário existente retorna apenas linhas compatíveis', async () => {
        await usersTable.searchFor(nomeExistente);
        await expect(usersTable.rows.first()).toContainText(nomeExistente);
        const nomes = await usersTable.columnValues('Name');
        for (const nome of nomes) expect(nome.toLowerCase()).toContain(nomeExistente.toLowerCase());
      });

      await test.step('busca por usuário inexistente não retorna linhas de dados', async () => {
        await usersTable.searchFor('zzz-usuario-inexistente-zzz');
        await expect(usersTable.rows).toHaveCount(0);
        // A aplicação exibe "Showing 1-0 of 0 entries" (intervalo incoerente). Asserimos o total, que é o dado relevante.
        await expect(usersTable.entriesInfo).toHaveText(/of 0 entries/);
      });

      await test.step('limpar a busca restaura a listagem', async () => {
        await usersTable.searchFor('');
        await expect(usersTable.rows).toHaveCount(5);
      });
    },
  );

  test('T03 - ordenação e paginação mantêm a consistência dos registros', { tag: ['@users'] }, async ({ usersTable }) => {
    await test.step('ordenação por nome: crescente e depois decrescente', async () => {
      await usersTable.setRowsPerPage('15'); // todos os registros visíveis para validar a ordem completa
      await usersTable.waitForData();

      const comparar = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' });

      await usersTable.sortButton('name').click();
      const crescente = await usersTable.columnValues('Name');
      expect(crescente, 'ordem crescente').toEqual([...crescente].sort(comparar));

      await usersTable.sortButton('name').click();
      const decrescente = await usersTable.columnValues('Name');
      expect(decrescente, 'ordem decrescente').toEqual([...decrescente].sort((a, b) => comparar(b, a)));
    });

    await test.step('paginação: navega entre páginas e mantém o contador coerente', async () => {
      await usersTable.setRowsPerPage('5');
      await expect(usersTable.rows).toHaveCount(5);
      const total = await usersTable.totalEntries();
      const idsPagina1 = await usersTable.columnValues('ID');

      await usersTable.pageButton(2).click();
      await expect(usersTable.entriesInfo).toHaveText(new RegExp(`Showing 6-10 of ${total} entries`));
      expect(await usersTable.columnValues('ID'), 'página 2 traz outros registros').not.toEqual(idsPagina1);

      await usersTable.nextPage.click();
      await expect(usersTable.entriesInfo).toHaveText(new RegExp(`Showing 11-${Math.min(15, total)} of ${total} entries`));

      await usersTable.prevPage.click();
      await expect(usersTable.entriesInfo).toHaveText(new RegExp(`Showing 6-10 of ${total} entries`));
    });
  });
});