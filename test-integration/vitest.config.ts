import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineWorkersConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: ['./**/*.test.{ts,tsx}'],
    poolOptions: {
      workers: {
        wrangler: { configPath: '../wrangler.jsonc' },
      },
    },
  },
});
