import { test, expect } from '@fixtures/base';
import { buildRegistrationData } from '@data/registration';

// Rastreabilidade com docs/matriz-de-cenarios.md e docs/matriz-de-riscos.md
// T04: FRM-01, FRM-05, FRM-07         | riscos RF-08, RF-09, RA-02
// T05: FRM-02, FRM-03, FRM-04, FRM-06 | riscos RF-07, RF-10, RU-05 (cenário negativo)
test.describe('Formulário de registro', () => {
  test(
    'T04 - registro válido exibe confirmação e o reset limpa o formulário',
    { tag: ['@smoke', '@forms', '@cross'] },
    async ({ registrationForm: form }) => {
      const dados = buildRegistrationData();

      await test.step('o preenchimento atualiza o contador da bio', async () => {
        await form.fill(dados);
        await expect(form.fullName).toHaveValue(dados.fullName);
        await expect(form.charCount).toHaveText(`${dados.bio.length}/200`);
      });

      await test.step('o reset devolve o formulário ao estado inicial', async () => {
        await form.resetButton.click();

        await expect(form.fullName).toHaveValue('');
        await expect(form.email).toHaveValue('');
        await expect(form.password).toHaveValue('');
        await expect(form.phone).toHaveValue('');
        await expect(form.dob).toHaveValue('');
        await expect(form.country).toHaveValue('');
        await expect(form.bio).toHaveValue('');
        await expect(form.terms).not.toBeChecked();
        await expect(form.gender(dados.gender)).not.toBeChecked();
        for (const skill of dados.skills) await expect(form.skill(skill)).not.toBeChecked();
        await expect(form.charCount).toHaveText('0/200');
      });

      // Depois do envio válido o formulário some, então o reset precisa ser validado antes
      await test.step('o envio com dados válidos exibe a confirmação, sem erros', async () => {
        await form.fill(buildRegistrationData());
        await form.submit();

        await expect(form.success).toBeVisible();
        await expect(form.success).toContainText('Registration successful');
        await form.expectNoErrors();
      });
    },
  );

  test(
    'T05 - formulário rejeita campos obrigatórios vazios, e-mail inválido, senha curta e excesso de caracteres',
    { tag: ['@forms', '@negative', '@cross'] },
    async ({ registrationForm: form }) => {
      await test.step('nome não excede o limite de 50 caracteres', async () => {
        // pressSequentially simula a digitação real, que respeita o atributo maxlength
        await form.fullName.pressSequentially('A'.repeat(60));
        await expect(form.fullName).toHaveValue('A'.repeat(50));
        await form.fullName.fill('');
      });

      await test.step('bio acima de 200 caracteres: defeito conhecido, o limite não é aplicado', async () => {
        // Comportamento atual: sem maxlength nem validação, o contador chega a "201/200" e o envio não é barrado.
        // A asserção registra esse estado; se o site corrigir, o teste falha e esta etapa deve ser atualizada.
        test.info().annotations.push({ type: 'defeito-conhecido', description: 'Bio aceita mais de 200 caracteres (RF-10)' });
        await form.bio.fill('a'.repeat(201));
        await expect(form.bio).toHaveValue('a'.repeat(201));
        await expect(form.charCount).toHaveText('201/200');
        await form.bio.fill('');
        await expect(form.charCount).toHaveText('0/200');
      });

      await test.step('envio vazio exibe todas as mensagens obrigatórias e não confirma o registro', async () => {
        await form.submit();

        await expect(form.errors.fullName).toHaveText('Name is required');
        await expect(form.errors.email).toHaveText('Valid email is required');
        await expect(form.errors.password).toHaveText('Password must be at least 8 characters');
        await expect(form.errors.terms).toHaveText('You must accept the terms');
        await expect(form.success).toBeHidden();
      });

      // As etapas seguintes são cumulativas de propósito: corrigem um campo por vez e provam que cada regra
      // atua isoladamente e que a mensagem some quando o valor é corrigido.
      await test.step('e-mail inválido: só o erro de e-mail permanece', async () => {
        const dados = buildRegistrationData({ email: 'not-an-email' });
        await form.fullName.fill(dados.fullName);
        await form.email.fill(dados.email);
        await form.password.fill(dados.password);
        await form.terms.check();
        await form.submit();

        await expect(form.errors.email).toHaveText('Valid email is required');
        await expect(form.errors.fullName).toHaveText('');
        await expect(form.errors.password).toHaveText('');
        await expect(form.errors.terms).toHaveText('');
        await expect(form.success).toBeHidden();
      });

      await test.step('senha com 7 caracteres (limite - 1) é rejeitada', async () => {
        const dados = buildRegistrationData();
        await form.email.fill(dados.email);
        await form.password.fill('Abcde1!');
        await form.submit();

        await expect(form.errors.password).toHaveText('Password must be at least 8 characters');
        await expect(form.errors.email).toHaveText('');
        await expect(form.success).toBeHidden();
      });

      await test.step('senha com 8 caracteres (limite) é aceita', async () => {
        await form.password.fill('Abcde12!');
        await form.submit();

        await expect(form.errors.password).toHaveText('');
        await expect(form.success).toBeVisible();
      });
    },
  );
});
