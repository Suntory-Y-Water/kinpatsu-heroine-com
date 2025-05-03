import 'dotenv/config';
import type { Config } from 'drizzle-kit';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_D1_TOKEN;

if (!accountId || !databaseId || !token) {
  throw new Error('環境変数が設定されていません');
}

export default {
  schema: './app/config/drizzle/schema.ts',
  out: './app/config/drizzle/migrations',
  driver: 'd1-http',
  dialect: 'sqlite',
  dbCredentials: {
    accountId: accountId,
    databaseId: databaseId,
    token: token,
  },
} satisfies Config;
