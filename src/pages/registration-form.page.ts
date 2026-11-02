import { expect, type Locator, type Page } from '@playwright/test';
import type { RegistrationData } from '@data/registration';

/**
 * Page Object do formulário de registro.
 * Campos localizados por LABEL/ROLE (o que também comprova a associação label ↔ campo, FRM-07).
 * Mensagens de erro e sucesso não têm role/label, então usam data-testid.
 * Os campos são escopados ao formulário para evitar colisões na página única. A mensagem de sucesso
 * fica fora dele de propósito: o site esconde o formulário quando o envio é válido.
 */
export class RegistrationFormPage {
  readonly form: Locator;
  readonly fullName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly phone: Locator;
  readonly dob: Locator;
  readonly country: Locator;
  readonly bio: Locator;
  readonly charCount: Locator;
  readonly terms: Locator;
  readonly registerButton: Locator;
  readonly resetButton: Locator;
  readonly success: Locator;
  readonly errors: Record<'fullName' | 'email' | 'password' | 'terms', Locator>;

  constructor(private readonly page: Page) {
    this.form = page.getByTestId('registration-form');
    this.fullName = this.form.getByLabel('Full Name *');
    this.email = this.form.getByLabel('Email Address *');
    // exact: o botão "Toggle password visibility" também casaria com "Password"
    this.password = this.form.getByLabel('Password *', { exact: true });
    this.phone = this.form.getByLabel('Phone Number');
    this.dob = this.form.getByLabel('Date of Birth');
    this.country = this.form.getByLabel('Country');
    this.bio = this.form.getByLabel('Bio');
    this.charCount = page.getByTestId('char-count');
    this.terms = this.form.getByRole('checkbox', { name: /I agree to the/ });
    this.registerButton = this.form.getByRole('button', { name: 'Register' });
    this.resetButton = this.form.getByRole('button', { name: 'Reset' });
    this.success = page.getByTestId('form-success');
    this.errors = {
      fullName: page.getByTestId('error-fullname'),
      email: page.getByTestId('error-email'),
      password: page.getByTestId('error-password'),
      terms: page.getByTestId('error-terms'),
    };
  }

  gender(nome: 'Male' | 'Female' | 'Other'): Locator {
    // exact: "Male" também casaria com "Female"
    return this.form.getByRole('radio', { name: nome, exact: true });
  }

  skill(nome: string): Locator {
    return this.form.getByRole('checkbox', { name: nome, exact: true });
  }

  async fill(dados: RegistrationData): Promise<void> {
    await this.fullName.fill(dados.fullName);
    await this.email.fill(dados.email);
    await this.password.fill(dados.password);
    await this.phone.fill(dados.phone);
    await this.dob.fill(dados.dob);
    await this.country.selectOption(dados.countryCode);
    await this.gender(dados.gender).check();
    for (const skill of dados.skills) await this.skill(skill).check();
    await this.bio.fill(dados.bio);
    await this.terms.check();
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  /** Exceção à regra "asserções nos testes": os campos de erro existem sempre e ficam vazios, então a checagem é repetitiva. */
  async expectNoErrors(): Promise<void> {
    for (const erro of Object.values(this.errors)) await expect(erro).toHaveText('');
  }
}
