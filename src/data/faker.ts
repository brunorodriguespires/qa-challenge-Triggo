import { faker } from '@faker-js/faker';

// Ponto único de geração, para que a seed valha para todas as factories.
// Seed opcional para reproduzir uma execução: FAKER_SEED=123 npx playwright test
if (process.env.FAKER_SEED) faker.seed(Number(process.env.FAKER_SEED));

export { faker };
