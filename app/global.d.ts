import type {} from 'hono';
import type { Metadata } from '@/lib/metadata';

declare module 'hono' {
  interface Env {
    Bindings: {
      R2_BUCKET: R2Bucket;
      R2_BUCKET_PREVIEW: R2Bucket;
      R2_ENDPOINT: string;
      DB: D1Database;
      ANNICT_CLIENT_ID: string;
      JWT_SECRET: string;
      ADMIN_USERNAME: string;
      ADMIN_PASSWORD_HASH: string;
      PUBLIC_APP_URL: string;
    };
  }
  interface ContextRenderer {
    // biome-ignore lint/style/useShorthandFunctionType: <explanation>
    (
      content: string | Promise<string>,
      head?: { metadata?: Metadata },
    ): Response | Promise<Response>;
  }
}
