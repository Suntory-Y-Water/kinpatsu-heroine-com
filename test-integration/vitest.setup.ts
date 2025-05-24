import { env, applyD1Migrations } from 'cloudflare:test';
import { beforeEach } from 'vitest';

beforeEach(async () => {
  if (env.DB && env.MIGRATIONS) {
    await applyD1Migrations(env.DB, env.MIGRATIONS);
  }
});
