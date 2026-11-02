import { faker } from '@data/faker';

export type Genero = 'Male' | 'Female' | 'Other';
export type Habilidade = 'JavaScript' | 'Python' | 'Java' | 'C#';

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  dob: string; // formato yyyy-mm-dd, exigido por <input type="date">
  countryCode: string; // value do <option>
  gender: Genero;
  skills: Habilidade[];
  bio: string;
}

/** Dados 100% fictícios. O domínio example.com é reservado e nunca entrega e-mail real. */
export function buildRegistrationData(overrides: Partial<RegistrationData> = {}): RegistrationData {
  const first = faker.person.firstName();
  const last = faker.person.lastName();
  return {
    fullName: `${first} ${last}`.slice(0, 50), // o campo tem maxlength=50
    email: faker.internet.email({ firstName: first, lastName: last, provider: 'example.com' }).toLowerCase(),
    password: `Qa!${faker.string.alphanumeric(10)}`, // >= 8 caracteres
    phone: `+1 (555) ${faker.string.numeric(3)}-${faker.string.numeric(4)}`,
    dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().slice(0, 10),
    countryCode: faker.helpers.arrayElement(['us', 'uk', 'ca', 'de', 'br']),
    gender: faker.helpers.arrayElement<Genero>(['Male', 'Female', 'Other']),
    skills: faker.helpers.arrayElements<Habilidade>(['JavaScript', 'Python', 'Java', 'C#'], { min: 1, max: 3 }),
    bio: faker.lorem.sentence({ min: 6, max: 12 }).slice(0, 120),
    ...overrides,
  };
}
