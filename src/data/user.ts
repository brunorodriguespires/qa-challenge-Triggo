import { faker } from '@data/faker';

export type Perfil = 'Admin' | 'Editor' | 'Viewer';

export interface NewUser {
  name: string;
  email: string;
  role: Perfil;
}

/** Nome único por execução, para a busca devolver exatamente o usuário criado. */
export function buildNewUser(overrides: Partial<NewUser> = {}): NewUser {
  const sufixo = faker.string.alpha({ length: 6, casing: 'lower' });
  return {
    name: `Qa ${faker.person.firstName()} ${sufixo}`,
    email: `qa.${sufixo}@example.com`,
    role: faker.helpers.arrayElement<Perfil>(['Admin', 'Editor', 'Viewer']),
    ...overrides,
  };
}
