import { SELF, env } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sign } from 'hono/jwt';

type AdminCharacterRecord = {
  character_id: number;
  work_id: number;
  character_name: string;
  work_name: string;
  character_image_url: string;
  is_registered: boolean;
  is_deleted: boolean;
  registration_date?: string;
};

async function generateAdminToken(payload?: object): Promise<string> {
  const defaultPayload = {
    role: 'admin',
    username: 'test_admin_user',
    exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
  };
  return await sign({ ...defaultPayload, ...payload }, env.JWT_SECRET);
}

async function insertAdminCharacters(characters: AdminCharacterRecord[]) {
  const stmts = characters.map((char) => {
    const {
      character_id,
      work_id,
      character_name,
      work_name,
      character_image_url,
      is_registered,
      is_deleted,
      registration_date = new Date().toISOString(),
    } = char;
    return env.DB.prepare(
      `INSERT INTO registration_queue_table
       (character_id, work_id, character_name, work_name, character_image_url, registration_date, is_registered, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(character_id, work_id) DO UPDATE SET
         character_name = excluded.character_name,
         work_name = excluded.work_name,
         character_image_url = excluded.character_image_url,
         registration_date = excluded.registration_date,
         is_registered = excluded.is_registered,
         is_deleted = excluded.is_deleted`,
    ).bind(
      character_id,
      work_id,
      character_name,
      work_name,
      character_image_url,
      registration_date,
      is_registered ? 1 : 0,
      is_deleted ? 1 : 0,
    );
  });
  if (stmts.length > 0) {
    await env.DB.batch(stmts);
  }
}

async function clearRegistrationQueueTable() {
  await env.DB.exec('DELETE FROM registration_queue_table;');
}

describe('GET /admin (app/routes/admin/index.tsx)', () => {
  let adminToken: string;

  beforeEach(async () => {
    await clearRegistrationQueueTable();
    adminToken = await generateAdminToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('認証済みの管理者がアクセスした場合、正常なレスポンス (ステータスコード 200) が返されること', async () => {
    const response = await SELF.fetch('http://localhost/admin', {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('管理画面');
  });

  it('受付待ちリスト (`tab=pending`) が正しく表示されること', async () => {
    const pendingChar: AdminCharacterRecord = {
      character_id: 1,
      work_id: 1,
      character_name: 'Pending Char',
      work_name: 'Pending Work',
      character_image_url: '/pending.png',
      is_registered: false,
      is_deleted: false,
    };
    const registeredChar: AdminCharacterRecord = {
      character_id: 2,
      work_id: 2,
      character_name: 'Registered Char',
      work_name: 'Registered Work',
      character_image_url: '/registered.png',
      is_registered: true,
      is_deleted: false,
    };
    await insertAdminCharacters([pendingChar, registeredChar]);

    const response = await SELF.fetch('http://localhost/admin?tab=pending', {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).toContain('Pending Char');
    expect(text).not.toContain('Registered Char');
  });

  it('登録済みリスト (`tab=registered`) が正しく表示されること', async () => {
    const pendingChar: AdminCharacterRecord = {
      character_id: 1,
      work_id: 1,
      character_name: 'Pending Char',
      work_name: 'Pending Work',
      character_image_url: '/pending.png',
      is_registered: false,
      is_deleted: false,
    };
    const registeredChar: AdminCharacterRecord = {
      character_id: 2,
      work_id: 2,
      character_name: 'Registered Char',
      work_name: 'Registered Work',
      character_image_url: '/registered.png',
      is_registered: true,
      is_deleted: false,
    };
    await insertAdminCharacters([pendingChar, registeredChar]);

    const response = await SELF.fetch('http://localhost/admin?tab=registered', {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).toContain('Registered Char');
    expect(text).not.toContain('Pending Char');
  });

  it('削除済みリスト (`tab=deleted`) が正しく表示されること', async () => {
    const deletedChar: AdminCharacterRecord = {
      character_id: 3,
      work_id: 3,
      character_name: 'Deleted Char',
      work_name: 'Deleted Work',
      character_image_url: '/deleted.png',
      is_registered: false,
      is_deleted: true,
    };
    const pendingChar: AdminCharacterRecord = {
      character_id: 1,
      work_id: 1,
      character_name: 'Pending Char',
      work_name: 'Pending Work',
      character_image_url: '/pending.png',
      is_registered: false,
      is_deleted: false,
    };
    await insertAdminCharacters([deletedChar, pendingChar]);

    const response = await SELF.fetch('http://localhost/admin?tab=deleted', {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).toContain('Deleted Char');
    expect(text).not.toContain('Pending Char');
  });

  it('受付待ちリストが空の場合、適切なメッセージが表示されること', async () => {
    const response = await SELF.fetch('http://localhost/admin?tab=pending', {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).toContain('受付待ちの登録リクエストはありません');
  });

  it('登録済みリストが空の場合、適切なメッセージが表示されること', async () => {
    const response = await SELF.fetch('http://localhost/admin?tab=registered', {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).toContain('登録済みのキャラクターはありません');
  });

  it('削除済みリストが空の場合、適切なメッセージが表示されること', async () => {
    const response = await SELF.fetch('http://localhost/admin?tab=deleted', {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).toContain('削除済みのキャラクターはありません');
  });

  it('DBエラー発生時に、適切なエラーページまたはメッセージが表示されること', async () => {
    const mockError = new Error(
      'Simulated DB Error for getRegistrationQueueTable',
    );
    const mockD1ResultError = {
      success: false,
      error: mockError.message,
      results: [],
      meta: { duration: 0 } as any,
    };

    const prepareSpy = vi.spyOn(env.DB, 'prepare');
    const mockStatement = {
      bind: vi.fn().mockReturnThis(),
      all: vi.fn().mockImplementation(async () => {
        return mockD1ResultError;
      }),
      select: vi.fn().mockReturnThis(), // For fluent interface like .select().from()
      from: vi.fn().mockImplementation(async () => {
        // Assuming select().from() is the final call for .all() in the actual code
        return mockD1ResultError;
      }),
    };
    prepareSpy.mockImplementation(() => mockStatement as any);

    const response = await SELF.fetch('http://localhost/admin', {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).toContain('通信エラーが発生しました。');
    expect(text).toContain('しばらく経ってから再度アクセスしてください。');

    prepareSpy.mockRestore();
  });

  it('クエリパラメータに status と message がある場合、StatusMessage が表示されること', async () => {
    const status = 'error';
    const message = '何らかのエラーが発生しました';
    const encodedMessage = encodeURIComponent(message);

    const response = await SELF.fetch(
      `http://localhost/admin?status=${status}&message=${encodedMessage}`,
      {
        headers: { Cookie: `admin_token=${adminToken}` },
      },
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('何らかのエラーが発生しました');
    expect(text).toContain('❌');
  });
});
