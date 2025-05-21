import {
  defineWorkersConfig,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineWorkersConfig(async () => {
  const migrationsPath = path.resolve(
    __dirname,
    '../app/config/drizzle/migrations',
  );
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [tsconfigPaths()],
    root: __dirname,
    test: {
      globals: true,
      include: ['./**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
      poolOptions: {
        workers: {
          wrangler: {
            configPath: path.resolve(__dirname, '../wrangler.jsonc'),
          },
          miniflare: {
            bindings: {
              JWT_SECRET: 'test_jwt_secret',
              ADMIN_USERNAME: 'test_admin',
              ADMIN_PASSWORD_HASH: 'test_admin_password_hash',
              PUBLIC_APP_URL: 'http://localhost',
              // ANNICT_CLIENT_ID: 'key',
              R2_ENDPOINT: 'http://localhost:5173/local-bucket',
              MIGRATIONS: migrations,
            },
          },
        },
      },
    },
  };
});
