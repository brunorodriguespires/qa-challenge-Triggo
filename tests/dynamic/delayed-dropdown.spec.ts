import { test, expect } from '@fixtures/base';

// Rastreabilidade com docs/matriz-de-cenarios.md e docs/matriz-de-riscos.md
// T06: DYN-01, DYN-02, DYN-07 | riscos RT-01, RU-04
// O principal risco de flakiness da suíte (RT-01) é tratado sem esperas fixas: cada etapa aguarda um estado observável.
test.describe('Dropdown assíncrono', () => {
  test(
    'T06 - dropdown carrega opções de forma assíncrona e permite a seleção',
    { tag: ['@dynamic', '@cross'] },
    async ({ delayedDropdown: dropdown }) => {
      await test.step('antes de carregar, a lista fica desabilitada', async () => {
        await expect(dropdown.select).toBeDisabled();
        await expect(dropdown.options).toHaveCount(1);
        await expect(dropdown.loader).toBeHidden();
      });

      await test.step('durante o carregamento, há indicação visível de progresso', async () => {
        await dropdown.loadButton.click();
        await expect(dropdown.loader).toHaveText('Loading options...');
        await expect(dropdown.loader).toBeVisible();
        await expect(dropdown.loadButton).toBeDisabled();
      });

      await test.step('ao terminar, a lista é habilitada e o indicador some', async () => {
        // Espera pela condição observável, sem tempo fixo
        await expect(dropdown.select).toBeEnabled();
        await expect(dropdown.loader).toBeHidden();
        await expect(dropdown.loadButton).toHaveText('Options Loaded');
        await expect(dropdown.options).toHaveText([
          'Select a category...',
          'Electronics',
          'Clothing',
          'Books',
          'Sports & Outdoors',
          'Home & Garden',
        ]);
      });

      await test.step('a opção carregada pode ser selecionada', async () => {
        await dropdown.select.selectOption({ label: 'Books' });
        await expect(dropdown.select).toHaveValue('books');
        await expect(dropdown.result).toHaveText('Selected: Books');
      });
    },
  );
});
