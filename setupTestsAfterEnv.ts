import { afterAll } from '@jest/globals';

afterAll(async () => {
  await global.__db?.close();
  global.__db = undefined;
});
