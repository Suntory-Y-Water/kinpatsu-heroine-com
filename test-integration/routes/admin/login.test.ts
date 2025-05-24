import { SELF, env } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { testGenerateAdminToken } from 'test-integration/utils';

vi.doMock('bcrypt-ts', () => ({
  compare: vi.fn(),
}));

describe('GET /admin/login (app/routes/admin/login.tsx)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('未認証のユーザーがアクセスした場合、ログインフォームが表示されること', async () => {
    const response = await SELF.fetch('http://localhost/admin/login');
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('管理者ログイン');
    expect(text).toContain('name="username"');
    expect(text).toContain('name="password"');
  });

  it('既に認証済みの管理者がアクセスした場合、/admin にリダイレクトされること', async () => {
    const token = await testGenerateAdminToken();
    const response = await SELF.fetch('http://localhost/admin/login', {
      headers: { Cookie: `admin_token=${token}` },
      redirect: 'manual',
    });
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/admin');
  });

  it('クエリパラメータに status と message がある場合、StatusMessage が表示されること', async () => {
    const status = 'error';
    const message = 'ログイン情報が間違っています。';
    const encodedMessage = encodeURIComponent(message);

    const response = await SELF.fetch(
      `http://localhost/admin/login?status=${status}&message=${encodedMessage}`,
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain(message);
    expect(text).toContain('❌');
  });
});

describe('POST /admin/login (app/routes/admin/login.tsx)', () => {
  let mockCompare: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    await env.DB.exec('DELETE FROM login_attempts_table;');
    const bcrypt = await import('bcrypt-ts');
    mockCompare = bcrypt.compare as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.skip('正しい認証情報の場合、認証が成功し、JWTがCookieにセットされ、/admin にリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('username', env.ADMIN_USERNAME);
    formData.append('password', 'test_admin_password');
    mockCompare.mockResolvedValue(true);

    const response = await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/admin');
    const cookie = response.headers.get('Set-Cookie');
    expect(cookie).toContain('admin_token=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('ユーザー名が間違っている場合、エラーメッセージが表示され、ログインページにリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('username', 'wrong_user');
    formData.append('password', 'test_admin_password');

    const response = await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin/login?status=error&message=');
    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent('ユーザー名、またはパスワードが間違っています。'),
      );
    }
  });

  it('パスワードが間違っている場合、エラーメッセージが表示され、ログインページにリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('username', env.ADMIN_USERNAME);
    formData.append('password', 'wrong_password');
    mockCompare.mockResolvedValue(false);

    const response = await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });
    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin/login?status=error&message=');
    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent('ユーザー名、またはパスワードが間違っています。'),
      );
    }
  });

  it('複数回ログインに失敗した場合、アカウントがロックアウトされること', async () => {
    mockCompare.mockResolvedValue(false);
    const ipAddress = '1.2.3.4';
    const username = env.ADMIN_USERNAME;

    for (let i = 0; i < 6; i++) {
      const loopFormData = new FormData();
      loopFormData.append('username', username);
      loopFormData.append('password', 'wrong_password');
      await SELF.fetch('http://localhost/admin/login', {
        method: 'POST',
        body: loopFormData,
        headers: { 'CF-Connecting-IP': ipAddress },
      });
    }

    const finalFormData = new FormData();
    finalFormData.append('username', username);
    finalFormData.append('password', 'wrong_password');
    const response = await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: finalFormData,
      headers: { 'CF-Connecting-IP': ipAddress },
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin/login?status=error&message=');
    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent(
          '不正ログインの検出により一時的にロックされています。',
        ),
      );
      expect(text).toContain(decodeURIComponent('秒後に再試行してください。'));
    }
  });

  it('ロックアウト中のユーザーがログインしようとした場合、ロックアウトメッセージが表示されること', async () => {
    mockCompare.mockResolvedValue(false);
    const ipAddress = '2.3.4.5';
    const username = env.ADMIN_USERNAME;
    const now = new Date();
    const lockoutUntil = new Date(now.getTime() + 60 * 1000).toISOString();
    await env.DB.prepare(
      `INSERT INTO login_attempts_table (ip_address, username, failed_attempts, last_failure_timestamp, lockout_until)
           VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(ipAddress, username, 6, now.toISOString(), lockoutUntil)
      .run();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', 'any_password');
    const response = await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formData,
      headers: { 'CF-Connecting-IP': ipAddress },
      redirect: 'manual',
    });
    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin/login?status=error&message=');
    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent(
          '不正ログインの検出により一時的にロックされています。',
        ),
      );
    }
  });

  it('ログイン試行回数がDBに記録・更新されること', async () => {
    mockCompare.mockResolvedValue(false);
    const ipAddress = '3.4.5.6';
    const username = env.ADMIN_USERNAME;
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', 'wrong_password');

    await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formData,
      headers: { 'CF-Connecting-IP': ipAddress },
    });
    let attempt = await env.DB.prepare(
      'SELECT * FROM login_attempts_table WHERE ip_address = ? AND username = ?',
    )
      .bind(ipAddress, username)
      .first<{ failed_attempts: number }>();
    expect(attempt?.failed_attempts).toBe(1);

    await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formData,
      headers: { 'CF-Connecting-IP': ipAddress },
    });
    attempt = await env.DB.prepare(
      'SELECT * FROM login_attempts_table WHERE ip_address = ? AND username = ?',
    )
      .bind(ipAddress, username)
      .first<{ failed_attempts: number }>();
    expect(attempt?.failed_attempts).toBe(2);
  });

  it.skip('ログイン成功後、ログイン試行回数がリセットされること', async () => {
    const ipAddress = '4.5.6.7';
    const username = env.ADMIN_USERNAME;
    mockCompare.mockResolvedValue(false);
    const formDataFail = new FormData();
    formDataFail.append('username', username);
    formDataFail.append('password', 'wrong_password');
    await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formDataFail,
      headers: { 'CF-Connecting-IP': ipAddress },
    });
    let attempt = await env.DB.prepare(
      'SELECT * FROM login_attempts_table WHERE ip_address = ? AND username = ?',
    )
      .bind(ipAddress, username)
      .first<{ failed_attempts: number }>();
    expect(attempt?.failed_attempts).toBe(1);

    mockCompare.mockResolvedValue(true);
    const formDataSuccess = new FormData();
    formDataSuccess.append('username', username);
    formDataSuccess.append('password', 'test_admin_password');
    await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formDataSuccess,
      headers: { 'CF-Connecting-IP': ipAddress },
    });
    attempt = await env.DB.prepare(
      'SELECT * FROM login_attempts_table WHERE ip_address = ? AND username = ?',
    )
      .bind(ipAddress, username)
      .first<{ failed_attempts: number }>();
    expect(attempt?.failed_attempts).toBe(0);
  });

  it('DBエラー発生時に、適切なエラーメッセージが表示されること (getLoginAttempt)', async () => {
    const formData = new FormData();
    formData.append('username', env.ADMIN_USERNAME);
    formData.append('password', 'test_admin_password');
    mockCompare.mockResolvedValue(true);

    const mockError = new Error('Simulated DB Get Error For Login Attempt');
    const originalDBPrepare = env.DB.prepare;

    vi.spyOn(env.DB, 'prepare').mockImplementation((sql: string) => {
      const lowerSql = sql.toLowerCase();
      if (
        lowerSql.includes('select') &&
        lowerSql.includes('from login_attempts_table') &&
        lowerSql.includes('where ip_address = ? and username = ?')
      ) {
        return {
          bind: vi.fn().mockReturnThis(),
          first: vi.fn().mockRejectedValue(mockError),
        } as any;
      }
      return originalDBPrepare.call(env.DB, sql);
    });

    const response = await SELF.fetch('http://localhost/admin/login', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });
    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    const message = encodeURIComponent(
      'ユーザー名、またはパスワードが間違っています。',
    );
    expect(redirectLocation).toBe(
      `/admin/login?status=error&message=${message}`,
    );
  });
});
