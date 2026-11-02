import type { Locator, Page } from '@playwright/test';

/** Page Object da área "Focus Trap" da seção de acessibilidade. */
export class FocusTrapPage {
  readonly openButton: Locator;
  readonly area: Locator;
  readonly input: Locator;
  readonly actionButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.openButton = page.getByTestId('focus-trap-open');
    this.area = page.getByRole('dialog', { name: 'Focus trap dialog' });
    this.input = this.area.getByTestId('focus-trap-input');
    this.actionButton = this.area.getByRole('button', { name: 'Action' });
    this.closeButton = this.area.getByRole('button', { name: 'Close Trap' });
  }
}
