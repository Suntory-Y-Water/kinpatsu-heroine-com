import 'dotenv/config';
import { readdirSync } from 'fs';
import { defineConfig } from 'drizzle-kit';

/**
 * @see https://zenn.dev/nikaera/articles/cloudflare-opennext-drizzle
 */

const isProduction = process.env.NODE_ENV === 'production';

// `sqliteDirPath` は、wrangler で D1 環境を設定し、`dev` コマンドを実行した際に
// SQLite ファイルが生成されるディレクトリパスを指します。
const sqliteDirPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const sqliteFilePath = readdirSync(sqliteDirPath).find((file) =>
  file.endsWith('.sqlite'),
);

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_D1_TOKEN;

if (!accountId || !databaseId || !token) {
  throw new Error(
    'CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, and CLOUDFLARE_D1_TOKEN must be set in the environment variables.',
  );
}

const config = isProduction
  ? defineConfig({
      schema: './app/config/drizzle/schema.ts',
      out: './app/config/drizzle/migrations',
      driver: 'd1-http',
      dialect: 'sqlite',
      dbCredentials: {
        accountId: accountId,
        databaseId: databaseId,
        token: token,
      },
    })
  : defineConfig({
      schema: './app/config/drizzle/schema.ts',
      out: './app/config/drizzle/migrations',
      dialect: 'sqlite',
      dbCredentials: {
        url: `${sqliteDirPath}/${sqliteFilePath}`,
      },
    });

export default config;
