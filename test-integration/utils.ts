// テスト用のユーティリティ関数
import { env } from 'cloudflare:test';
import { sign } from 'hono/jwt';

export async function testGenerateAdminToken(): Promise<string> {
  return await sign(
    {
      role: 'admin',
      username: 'test_admin_user',
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
    },
    env.JWT_SECRET,
  );
}
