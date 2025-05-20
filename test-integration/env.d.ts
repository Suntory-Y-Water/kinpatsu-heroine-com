import type { Env as WorkerEnv } from '../worker-configuration';

declare module 'cloudflare:test' {
  interface ProvidedEnv extends WorkerEnv {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    MIGRATIONS?: D1Migration[];
  }
}
