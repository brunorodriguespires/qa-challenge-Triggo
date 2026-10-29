import { expect, type Locator, type Page } from '@playwright/test';

export const COLUNAS_ESPERADAS = ['ID', 'Name', 'Email', 'Role', 'Status', 'Actions'] as const;
export type Coluna = (typeof COLUNAS_ESPERADAS)[number];
export type ColunaOrdenavel = 'id' | 'name' | 'email' | 'status';

/**
 * Page Object leve da seção "User Management".
 * Expõe locators e ações; as ASSERÇÕES ficam nos testes, para não esconder a intenção.
 */
export class UsersTablePage {
  readonly card: Locator;
  readonly table: Locator;
  readonly headers: Locator;
  readonly rows: Locator;
  readonly search: Locator;
  readonly roleFilter: Locator;
  readonly rowsPerPage: Locator;
  readonly entriesInfo: Locator;
  readonly addUserButton: Locator;
  readonly nextPage: Locator;
  readonly prevPage: Locator;
  // Modal "Add New User"
  readonly modal: Locator;
  readonly newUserName: Locator;
  readonly newUserEmail: Locator;
  readonly newUserRole: Locator;
  readonly modalConfirm: Locator;
  readonly modalCancel: Locator;

  constructor(private readonly page: Page) {
    this.card = page.getByTestId('table-card');
    this.table = page.getByTestId('data-table');
    this.headers = this.table.getByRole('columnheader');
    this.rows = page.getByTestId('table-body').getByTestId(/^table-row-/);
    this.search = page.getByTestId('table-search');
    this.roleFilter = page.getByTestId('table-filter');
    this.rowsPerPage = page.getByTestId('rows-per-page');
    this.entriesInfo = page.getByTestId('table-info');
    this.addUserButton = page.getByTestId('add-row-btn');
    this.nextPage = page.getByTestId('page-next');
    this.prevPage = page.getByTestId('page-prev');

    this.modal = page.getByTestId('modal');
    this.newUserName = page.getByTestId('new-user-name');
    this.newUserEmail = page.getByTestId('new-user-email');
    this.newUserRole = page.getByTestId('new-user-role');
    this.modalConfirm = page.getByTestId('modal-confirm');
    this.modalCancel = page.getByTestId('modal-cancel');
  }

  sortButton(coluna: ColunaOrdenavel): Locator {
    return this.page.getByTestId(`sort-${coluna}`);
  }

  pageButton(numero: number): Locator {
    return this.page.getByTestId(`page-${numero}`);
  }

  /** Os cabeçalhos são exibidos em maiúsculas por CSS, então a busca ignora caixa. */
  headerByName(coluna: Coluna): Locator {
    return this.headers.filter({ hasText: new RegExp(`^\\s*${coluna}`, 'i') });
  }

  /**
   * Índice da coluna pelo NOME do cabeçalho (não pela posição fixa).
   * Usa textContent (texto do DOM) e não innerText, que já vem transformado pelo CSS.
   * A primeira coluna da tabela é um checkbox sem título e entra na contagem.
   */
  async columnIndex(coluna: Coluna): Promise<number> {
    const textos = await this.headers.evaluateAll((ths) => ths.map((th) => th.textContent?.trim() ?? ''));
    const indice = textos.findIndex((t) => t.toLowerCase().startsWith(coluna.toLowerCase()));
    if (indice < 0) throw new Error(`Coluna "${coluna}" não encontrada. Cabeçalhos: ${textos.join(' | ')}`);
    return indice;
  }

  /** Valores (texto) de uma coluna nas linhas atualmente visíveis. */
  async columnValues(coluna: Coluna): Promise<string[]> {
    const indice = await this.columnIndex(coluna);
    return this.rows.evaluateAll(
      (linhas, i) => linhas.map((l) => (l as HTMLTableRowElement).cells[i]?.textContent?.trim() ?? ''),
      indice,
    );
  }

  /** Total de registros, lido do texto "Showing 1-5 of 15 entries". */
  async totalEntries(): Promise<number> {
    const texto = (await this.entriesInfo.textContent()) ?? '';
    const match = texto.match(/of\s+(\d+)/i);
    if (!match) throw new Error(`Não foi possível ler o total em: "${texto}"`);
    return Number(match[1]);
  }

  async searchFor(texto: string): Promise<void> {
    await this.search.fill(texto);
  }

  async setRowsPerPage(valor: '5' | '10' | '15'): Promise<void> {
    await this.rowsPerPage.selectOption(valor);
  }

  async addUser(dados: { name: string; email: string; role?: 'Admin' | 'Editor' | 'Viewer' }): Promise<void> {
    await this.addUserButton.click();
    await this.newUserName.fill(dados.name);
    await this.newUserEmail.fill(dados.email);
    if (dados.role) await this.newUserRole.selectOption(dados.role);
    await this.modalConfirm.click();
  }

  /** Garante que a tabela terminou de renderizar (há ao menos uma linha de dados). */
  async waitForData(): Promise<void> {
    await expect(this.rows.first()).toBeVisible();
  }
}