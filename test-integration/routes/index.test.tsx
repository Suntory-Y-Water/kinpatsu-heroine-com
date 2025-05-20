import { SELF, env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

describe('ルート / のテスト (app/routes/index.tsx)', () => {
  it('正常なHTTPステータスコード200でレスポンスが返され、基本的なHTML構造が含まれていること', async () => {
    const response = await SELF.fetch('http://localhost/');

    expect(response.status).toBe(200);
    const text = await response.text();
    console.log(text);

    expect(text).toContain('金髪ヒロイン.com');
    expect(text).toContain('© 2025 金髪ヒロイン.com');

    expect(text).toContain('新着順');
  });

  it('テスト環境でD1データベースバインディング (env.DB) が利用可能であること', async () => {
    expect(env.DB).toBeDefined();

    const result = await env.DB.prepare(
      'SELECT name FROM sqlite_master WHERE type="table"',
    ).all();
    expect(result.success).toBe(true);
  });

  it('テスト環境でR2バケットバインディング (env.R2_BUCKET) が利用可能であること', async () => {
    expect(env.R2_BUCKET).toBeDefined();
  });
});
