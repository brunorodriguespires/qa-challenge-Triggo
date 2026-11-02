import type { Locator, Page } from '@playwright/test';

/** Page Object do "Delayed Dropdown": as opções só chegam cerca de 2 s depois do clique em "Load Options". */
export class DelayedDropdownPage {
  readonly card: Locator;
  readonly loadButton: Locator;
  readonly select: Locator;
  readonly options: Locator;
  readonly loader: Locator;
  readonly result: Locator;

  constructor(page: Page) {
    this.card = page.getByTestId('delayed-dropdown-card');
    this.loadButton = this.card.getByTestId('load-delayed-dropdown-btn');
    this.select = this.card.getByLabel('Select Category');
    this.options = this.select.getByRole('option');
    this.loader = this.card.getByTestId('delayed-dropdown-loader');
    this.result = this.card.getByTestId('delayed-dropdown-result');
  }
}
