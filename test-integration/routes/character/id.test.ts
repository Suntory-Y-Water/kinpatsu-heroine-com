import { SELF, env } from 'cloudflare:test';
import { testInsertAdminCharacter } from 'test-integration/utils';

describe('GET /character/:id (app/routes/character/[id].tsx)', () => {
  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');
    await env.DB.exec('DELETE FROM work_table;');
    await env.DB.exec('DELETE FROM character_table;');
    await env.DB.exec('DELETE FROM streaming_site_table;');
    await env.DB.exec('DELETE FROM work_streaming_site_table;');
    await env.DB.exec('DELETE FROM like_history_table;');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('存在するキャラクターIDの場合、正常なレスポンス (ステータスコード 200) とキャラクター詳細情報が返されること', async () => {
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
      .bind(
        101,
        'https://example.com/official',
        'https://ja.wikipedia.org/wiki/Test',
      )
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(1, 101)
      .run();

    await env.DB.prepare(
      'INSERT INTO streaming_site_table (streaming_site_id, streaming_site_name) VALUES (?, ?)',
    )
      .bind('netflix.com', 'Netflix')
      .run();

    await env.DB.prepare(
      'INSERT INTO work_streaming_site_table (work_id, streaming_site_id, streaming_site_url) VALUES (?, ?, ?)',
    )
      .bind(101, 'netflix.com', 'https://netflix.com/test')
      .run();

    const response = await SELF.fetch('http://localhost/character/1');

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('Test Character');
    expect(text).toContain('Test Work');
    expect(text).toContain('/test.png');
    expect(text).toContain('関連リンク');
    expect(text).toContain('公式サイト');
    expect(text).toContain('Wikipedia');
    expect(text).toContain('視聴できる配信サービス');
    expect(text).toContain('Netflix');
  });

  it('存在しないキャラクターIDの場合、404エラーが返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/999');

    expect(response.status).toBe(404);
  });

  it('キャラクターのいいね数が正しく表示されること', async () => {
    const testCharacter = {
      character_id: 2,
      work_id: 102,
      character_name: 'Liked Character',
      work_name: 'Popular Work',
      character_image_url: '/liked.png',
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

    await env.DB.prepare(
      'INSERT INTO like_history_table (character_id, cookie_id) VALUES (?, ?)',
    )
      .bind(2, 'user1')
      .run();
    await env.DB.prepare(
      'INSERT INTO like_history_table (character_id, cookie_id) VALUES (?, ?)',
    )
      .bind(2, 'user2')
      .run();
    await env.DB.prepare(
      'INSERT INTO like_history_table (character_id, cookie_id) VALUES (?, ?)',
    )
      .bind(2, 'user3')
      .run();

    const response = await SELF.fetch('http://localhost/character/2');

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('Liked Character');
    expect(text).toContain('3');
  });

  it('論理削除されたキャラクターの場合、404エラーが返されること', async () => {
    const deletedCharacter = {
      character_id: 5,
      work_id: 105,
      character_name: 'Deleted Character',
      work_name: 'Deleted Work',
      character_image_url: '/deleted.png',
      is_registered: true,
      is_deleted: true,
    };
    await testInsertAdminCharacter(deletedCharacter);

    const response = await SELF.fetch('http://localhost/character/5');

    expect(response.status).toBe(404);
  });

  it('未登録のキャラクターの場合、正常にレスポンスが返されること', async () => {
    const unregisteredCharacter = {
      character_id: 6,
      work_id: 106,
      character_name: 'Unregistered Character',
      work_name: 'Pending Work',
      character_image_url: '/pending.png',
      is_registered: false,
      is_deleted: false,
    };
    await testInsertAdminCharacter(unregisteredCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(106, '', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(6, 106)
      .run();

    const response = await SELF.fetch('http://localhost/character/6');

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('Unregistered Character');
  });

  it('配信サイト情報がない場合でも、その他の情報は正常に表示されること', async () => {
    const testCharacter = {
      character_id: 7,
      work_id: 107,
      character_name: 'No Streaming Character',
      work_name: 'Classic Work',
      character_image_url: '/classic.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(107, 'https://example.com/classic', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(7, 107)
      .run();

    const response = await SELF.fetch('http://localhost/character/7');

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('No Streaming Character');
    expect(text).toContain('Classic Work');
    expect(text).toContain('公式サイト');
    expect(text).not.toContain('視聴できる配信サービス');
  });

  it('関連リンク情報がない場合、関連リンクセクションが表示されないこと', async () => {
    const testCharacter = {
      character_id: 8,
      work_id: 108,
      character_name: 'No Links Character',
      work_name: 'Simple Work',
      character_image_url: '/simple.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(108, '', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(8, 108)
      .run();

    const response = await SELF.fetch('http://localhost/character/8');

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('No Links Character');
    expect(text).toContain('Simple Work');
    expect(text).not.toContain('関連リンク');
  });

  it('DBエラー発生時に、適切なエラーページまたはメッセージが表示されること', async () => {
    const testCharacter = {
      character_id: 9,
      work_id: 109,
      character_name: 'Error Character',
      work_name: 'Error Work',
      character_image_url: '/error.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    const mockError = new Error('Database connection failed');
    const prepareSpy = vi.spyOn(env.DB, 'prepare');

    prepareSpy.mockImplementation((sql: string) => {
      if (sql.includes('SELECT') && sql.includes('registration_queue_table')) {
        throw mockError;
      }
      return env.DB.prepare(sql);
    });

    const response = await SELF.fetch('http://localhost/character/9');

    expect(response.status).toBe(404);

    prepareSpy.mockRestore();
  });

  it('不正な文字列IDの場合、適切にハンドリングされること', async () => {
    const response = await SELF.fetch('http://localhost/character/invalid');

    expect(response.status).toBe(404);
  });

  it('負数IDの場合、404エラーが返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/-1');

    expect(response.status).toBe(404);
  });

  it('ゼロIDの場合、404エラーが返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/0');

    expect(response.status).toBe(404);
  });

  it('非常に大きなIDの場合、404エラーが返されること', async () => {
    const response = await SELF.fetch('http://localhost/character/999999999');

    expect(response.status).toBe(404);
  });

  it('複数のいいね履歴があるキャラクターでも正確ないいね数が表示されること', async () => {
    const testCharacter = {
      character_id: 10,
      work_id: 110,
      character_name: 'Popular Character',
      work_name: 'Hit Work',
      character_image_url: '/popular.png',
      is_registered: true,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(110, '', '')
      .run();

    await env.DB.prepare(
      'INSERT INTO character_table (character_id, work_id) VALUES (?, ?)',
    )
      .bind(10, 110)
      .run();

    for (let i = 1; i <= 5; i++) {
      await env.DB.prepare(
        'INSERT INTO like_history_table (character_id, cookie_id) VALUES (?, ?)',
      )
        .bind(10, `user${i}`)
        .run();
    }

    const response = await SELF.fetch('http://localhost/character/10');

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('Popular Character');
    expect(text).toContain('5');
  });
});
