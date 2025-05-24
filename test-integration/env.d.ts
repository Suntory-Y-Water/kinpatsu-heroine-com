import type { Env as WorkerEnv } from '../worker-configuration';

declare module 'cloudflare:test' {
  interface ProvidedEnv extends WorkerEnv {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    MIGRATIONS?: D1Migration[];
    PUBLIC_APP_URL: string;
    ANNICT_CLIENT_ID: string;
    JWT_SECRET: string;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD_HASH: string;
    R2_ENDPOINT: string;
  }
}
