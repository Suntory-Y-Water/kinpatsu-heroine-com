// test-integration/routes/character/like.test.ts
import { SELF, env } from 'cloudflare:test';
import { testInsertAdminCharacter } from 'test-integration/utils';

describe('POST /character/like (app/routes/character/like/index.ts)', () => {
  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');
    await env.DB.exec('DELETE FROM character_table;');
    await env.DB.exec('DELETE FROM work_table;');
    await env.DB.exec('DELETE FROM like_history_table;');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('有効なキャラクターIDで初めていいねする場合、like_history_table にレコードが追加され、成功レスポンス (ステータスコード 200) と更新後のいいね総数が返されること', async () => {
    const testCharacter = {
      character_id: 1,
      work_id: 101,
      character_name: 'Test Character',
      work_name: 'Test Work',
      character_image_url: '/test.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(101, '', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(1, 101)
      .run();

    const visitorCookieId = 'test_visitor_123';
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `visitor_id=${visitorCookieId}`,
      },
      body: JSON.stringify({ characterId: 1 }),
    });

    expect(response.status).toBe(200);
    const responseData = await response.json<{
      success: boolean;
      likes: number;
      message: string;
    }>();
    expect(responseData.success).toBe(true);
    expect(responseData.likes).toBe(1);
    expect(responseData.message).toBe('いいねを登録しました');

    const likeRecord = await env.DB.prepare(
      'SELECT * FROM like_history_table WHERE character_id = ? AND cookie_id = ?',
    )
      .bind(1, visitorCookieId)
      .first<{ character_id: number; cookie_id: string }>();
    expect(likeRecord).toBeTruthy();
    expect(likeRecord?.character_id).toBe(1);
    expect(likeRecord?.cookie_id).toBe(visitorCookieId);
  });

  it('visitor_id Cookieが存在しない場合、新しく生成されレスポンスヘッダーにセットされること', async () => {
    const testCharacter = {
      character_id: 2,
      work_id: 102,
      character_name: 'New Cookie Character',
      work_name: 'New Cookie Work',
      character_image_url: '/newcookie.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(102, '', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(2, 102)
      .run();

    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characterId: 2 }),
    });

    expect(response.status).toBe(200);
    const responseData = await response.json<{
      success: boolean;
      likes: number;
      message: string;
    }>();
    expect(responseData.success).toBe(true);
    expect(responseData.likes).toBe(1);

    const setCookieHeader = response.headers.get('Set-Cookie');
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain('visitor_id=');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader).toContain('SameSite=Lax');
  });

  it('既に同じキャラクターIDとCookieIDの組み合わせでいいね済みの場合、重複登録はされず、適切なレスポンス (ステータスコード 409) が返されること', async () => {
    const testCharacter = {
      character_id: 3,
      work_id: 103,
      character_name: 'Already Liked Character',
      work_name: 'Already Liked Work',
      character_image_url: '/alreadyliked.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(103, '', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(3, 103)
      .run();

    const visitorCookieId = 'duplicate_visitor_123';
    await env.DB.prepare(
      'INSERT INTO like_history_table (character_id, cookie_id) VALUES (?, ?)',
    )
      .bind(3, visitorCookieId)
      .run();

    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `visitor_id=${visitorCookieId}`,
      },
      body: JSON.stringify({ characterId: 3 }),
    });

    expect(response.status).toBe(409);
    const responseData = await response.json<{
      success: boolean;
      likes: number;
      message: string;
    }>();
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('既にいいね済みです');

    const likeRecords = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM like_history_table WHERE character_id = ? AND cookie_id = ?',
    )
      .bind(3, visitorCookieId)
      .first<{ count: number }>();
    expect(likeRecords?.count).toBe(1);
  });

  it('不正なリクエストボディ (characterIdなし) の場合、エラーレスポンス (ステータスコード 400) が返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
  });

  it('不正なリクエストボディ (characterIdが数値以外) の場合、エラーレスポンス (ステータスコード 400) が返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characterId: 'invalid' }),
    });

    expect(response.status).toBe(400);
  });

  it('不正なリクエストボディ (characterIdが負数) の場合、エラーレスポンス (ステータスコード 400) が返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characterId: -1 }),
    });

    expect(response.status).toBe(400);
  });

  it('不正なリクエストボディ (characterIdがゼロ) の場合、エラーレスポンス (ステータスコード 400) が返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characterId: 0 }),
    });

    expect(response.status).toBe(400);
  });

  it('存在しないキャラクターIDの場合、外部キー制約により500エラーが返されること', async () => {
    const nonExistentCharacterId = 999;
    const visitorCookieId = 'nonexistent_visitor_123';

    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `visitor_id=${visitorCookieId}`,
      },
      body: JSON.stringify({ characterId: nonExistentCharacterId }),
    });

    expect(response.status).toBe(500);
    const responseData = await response.json<{
      success: boolean;
      likes: number;
      message: string;
    }>();
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('いいねの処理中にエラーが発生しました');
  });

  it('複数のユーザーが同じキャラクターにいいねした場合、正確ないいね総数が返されること', async () => {
    const testCharacter = {
      character_id: 4,
      work_id: 104,
      character_name: 'Popular Character',
      work_name: 'Popular Work',
      character_image_url: '/popular.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(104, '', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(4, 104)
      .run();

    await env.DB.prepare(
      'INSERT INTO like_history_table (character_id, cookie_id) VALUES (?, ?)',
    )
      .bind(4, 'user1')
      .run();
    await env.DB.prepare(
      'INSERT INTO like_history_table (character_id, cookie_id) VALUES (?, ?)',
    )
      .bind(4, 'user2')
      .run();

    const newVisitorCookieId = 'user3';
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `visitor_id=${newVisitorCookieId}`,
      },
      body: JSON.stringify({ characterId: 4 }),
    });

    expect(response.status).toBe(200);
    const responseData = await response.json<{
      success: boolean;
      likes: number;
      message: string;
    }>();
    expect(responseData.success).toBe(true);
    expect(responseData.likes).toBe(3);
  });

  it('不正なJSONリクエストボディの場合、エラーレスポンス (ステータスコード 400) が返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    expect(response.status).toBe(400);
  });

  it('Content-Typeが不正な場合、エラーレスポンス (ステータスコード 400) が返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ characterId: 1 }),
    });

    expect(response.status).toBe(400);
  });

  it('DBエラー発生時に、エラーレスポンス (ステータスコード 500) が返されること', async () => {
    const testCharacter = {
      character_id: 5,
      work_id: 105,
      character_name: 'Error Character',
      work_name: 'Error Work',
      character_image_url: '/error.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(105, '', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(5, 105)
      .run();

    const mockError = new Error('Database connection failed');
    const prepareSpy = vi.spyOn(env.DB, 'prepare');
    const mockStatement = {
      bind: vi.fn().mockReturnThis(),
      run: vi.fn().mockRejectedValue(mockError),
      first: vi.fn().mockReturnThis(),
      all: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    prepareSpy.mockImplementation((sql: string) => {
      if (
        sql.includes('SELECT') &&
        sql.includes('like_history_table') &&
        sql.includes('WHERE')
      ) {
        return mockStatement as any;
      }
      return env.DB.prepare(sql);
    });

    const visitorCookieId = 'error_visitor_123';
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `visitor_id=${visitorCookieId}`,
      },
      body: JSON.stringify({ characterId: 5 }),
    });

    expect(response.status).toBe(500);
    const responseData = await response.json<{
      success: boolean;
      likes: number;
      message: string;
    }>();
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('いいねの処理中にエラーが発生しました');

    prepareSpy.mockRestore();
  });

  it('GET以外のHTTPメソッドでアクセスした場合、適切にハンドリングされること', async () => {
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'GET',
    });

    expect(response.status).toBe(404);
  });

  it('リクエストボディが空の場合、エラーレスポンス (ステータスコード 400) が返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(400);
  });

  it('非常に大きなcharacterIdの場合、外部キー制約により500エラーが返されること', async () => {
    const largeCharacterId = 999999999;
    const visitorCookieId = 'large_id_visitor_123';

    const response = await SELF.fetch('http://localhost/character/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `visitor_id=${visitorCookieId}`,
      },
      body: JSON.stringify({ characterId: largeCharacterId }),
    });

    expect(response.status).toBe(500);
    const responseData = await response.json<{
      success: boolean;
      likes: number;
      message: string;
    }>();
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('いいねの処理中にエラーが発生しました');
  });
});
