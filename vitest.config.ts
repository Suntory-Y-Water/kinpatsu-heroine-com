import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    exclude: [
      'node_modules',
      'dist',
      '.wrangler',
      '.github',
      '.devcontainer',
      'public',
      'scripts',
      'test-integration',
      'test-e2e',
    ],
  },
});
