import { SELF, env } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type CharacterRecord = {
  character_id: number;
  work_id: number;
  character_name: string;
  work_name: string;
  character_image_url: string;
  registration_date?: string; // ISO string
  is_registered?: boolean;
  is_deleted?: boolean;
  likes?: number;
};

async function insertCharacters(characters: CharacterRecord[]) {
  const registrationQueueStmts = [];
  const likeHistoryStmts = [];

  for (const char of characters) {
    const {
      character_id,
      work_id,
      character_name,
      work_name,
      character_image_url,
      registration_date = new Date().toISOString(),
      is_registered = true,
      is_deleted = false,
      likes = 0,
    } = char;

    registrationQueueStmts.push(
      env.DB.prepare(
        `INSERT INTO registration_queue_table (character_id, work_id, character_name, work_name, character_image_url, registration_date, is_registered, is_deleted)
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
      ),
    );

    if (likes > 0) {
      for (let i = 0; i < likes; i++) {
        likeHistoryStmts.push(
          env.DB.prepare(
            `INSERT OR IGNORE INTO like_history_table (character_id, cookie_id, registration_date)
             VALUES (?, ?, ?)`,
          ).bind(
            character_id,
            `test-cookie-${character_id}-${i}`,
            new Date().toISOString(),
          ),
        );
      }
    }
  }

  if (registrationQueueStmts.length > 0) {
    await env.DB.batch(registrationQueueStmts);
  }
  if (likeHistoryStmts.length > 0) {
    await env.DB.batch(likeHistoryStmts);
  }
}

async function clearTestTables() {
  // 外部キー制約を考慮し、依存される側から削除
  await env.DB.exec('DELETE FROM like_history_table;');
  await env.DB.exec('DELETE FROM registration_queue_table;');
  // 他にテストで利用するテーブルがあればここに追加
}

describe('GET / (app/routes/index.tsx)', () => {
  beforeEach(async () => {
    // 各テストの前にテーブルをクリーンな状態にする
    await clearTestTables();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('キャラクター情報がDBから取得され、正しく表示されること', async () => {
    const charactersToInsert: CharacterRecord[] = [
      {
        character_id: 1,
        work_id: 1,
        character_name: 'Character Alpha',
        work_name: 'Work One',
        character_image_url: '/img/alpha.png',
        registration_date: new Date('2024-01-02T10:00:00Z').toISOString(),
      },
      {
        character_id: 2,
        work_id: 1,
        character_name: 'Character Beta',
        work_name: 'Work One',
        character_image_url: '/img/beta.png',
        registration_date: new Date('2024-01-01T10:00:00Z').toISOString(),
      },
    ];
    await insertCharacters(charactersToInsert);

    const response = await SELF.fetch('http://localhost/');
    const text = await response.text();

    expect(response.status).toBe(200);
    // デフォルトソート(newest)では登録日の降順でソートされるため、
    // 登録日が新しい Character Alpha が先に表示される
    expect(text).toContain('Character Alpha');
    expect(text).toContain('/img/alpha.png');
    expect(text).toContain('Character Beta');
    expect(text).toContain('/img/beta.png');
  });

  it('不正な sort クエリパラメータが指定された場合、デフォルトのソート順 (`newest`) で表示されること', async () => {
    const charOld = {
      character_id: 2,
      work_id: 1,
      character_name: 'Oldest Char',
      work_name: 'Sort Test',
      character_image_url: '/img/oldest.png',
      registration_date: new Date('2023-01-01T10:00:00Z').toISOString(),
    };
    const charNew = {
      character_id: 1,
      work_id: 1,
      character_name: 'Newest Char',
      work_name: 'Sort Test',
      character_image_url: '/img/newest.png',
      registration_date: new Date('2024-01-01T10:00:00Z').toISOString(),
    };
    // 'newest' ソートは registration_date 降順のため、登録日が新しい Newest Char が先に表示される
    await insertCharacters([charNew, charOld]);

    const response = await SELF.fetch(
      'http://localhost/?sort=invalidSortValue',
    );
    const text = await response.text();
    expect(response.status).toBe(200);

    const newCharIndex = text.indexOf('Newest Char');
    const oldCharIndex = text.indexOf('Oldest Char');
    expect(newCharIndex).toBeGreaterThan(-1);
    expect(oldCharIndex).toBeGreaterThan(-1);
    // デフォルトソート'newest'では、登録日が新しいものが先に表示される
    expect(newCharIndex).toBeLessThan(oldCharIndex);
  });

  it('クエリパラメータに status と message がある場合、StatusMessage が表示されること', async () => {
    await insertCharacters([
      {
        character_id: 99,
        work_id: 9,
        character_name: 'MsgChar',
        work_name: 'MsgWork',
        character_image_url: '/img/msg.png',
      },
    ]);

    const status = 'success';
    const message = '操作が正常に完了しました。やったね！';
    const encodedMessage = encodeURIComponent(message);

    const response = await SELF.fetch(
      `http://localhost/?status=${status}&message=${encodedMessage}`,
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('操作が正常に完了しました。やったね！'); // デコードされたメッセージ
  });

  it('検索クエリにマッチするキャラクターが表示されること', async () => {
    const charactersToInsert: CharacterRecord[] = [
      {
        character_id: 1,
        work_id: 1,
        character_name: 'アリス',
        work_name: 'ワンダーランド',
        character_image_url: '/img/alice.png',
      },
      {
        character_id: 2,
        work_id: 2,
        character_name: '桜',
        work_name: '春の物語',
        character_image_url: '/img/sakura.png',
      },
      {
        character_id: 3,
        work_id: 3,
        character_name: 'ベティ',
        work_name: 'アメリカン・ドリーム',
        character_image_url: '/img/betty.png',
      },
    ];
    await insertCharacters(charactersToInsert);

    const response = await SELF.fetch('http://localhost/?q=アリス');
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('アリス');
    expect(text).toContain('/img/alice.png');
    expect(text).not.toContain('桜');
    expect(text).not.toContain('ベティ');
  });

  it('検索クエリにマッチしないキャラクターがある場合、該当なしメッセージが表示されること', async () => {
    const charactersToInsert: CharacterRecord[] = [
      {
        character_id: 1,
        work_id: 1,
        character_name: 'アリス',
        work_name: 'ワンダーランド',
        character_image_url: '/img/alice.png',
      },
    ];
    await insertCharacters(charactersToInsert);

    const response = await SELF.fetch(
      'http://localhost/?q=存在しないキャラクター',
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('検索結果が見つかりません');
    expect(text).toContain('全てのキャラクターを見る');
    expect(text).not.toContain('アリス');
  });

  it('部分一致検索が正常に動作すること', async () => {
    const charactersToInsert: CharacterRecord[] = [
      {
        character_id: 1,
        work_id: 1,
        character_name: 'アリス・インワンダーランド',
        work_name: 'ワンダーランド',
        character_image_url: '/img/alice.png',
      },
      {
        character_id: 2,
        work_id: 2,
        character_name: 'アリスター',
        work_name: 'ファンタジー',
        character_image_url: '/img/alister.png',
      },
      {
        character_id: 3,
        work_id: 3,
        character_name: '桜',
        work_name: '春の物語',
        character_image_url: '/img/sakura.png',
      },
    ];
    await insertCharacters(charactersToInsert);

    const response = await SELF.fetch('http://localhost/?q=アリス');
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('アリス・インワンダーランド');
    expect(text).toContain('アリスター');
    expect(text).not.toContain('桜');
  });

  it('空の検索クエリでは全キャラクターが表示されること', async () => {
    const charactersToInsert: CharacterRecord[] = [
      {
        character_id: 1,
        work_id: 1,
        character_name: 'アリス',
        work_name: 'ワンダーランド',
        character_image_url: '/img/alice.png',
      },
      {
        character_id: 2,
        work_id: 2,
        character_name: '桜',
        work_name: '春の物語',
        character_image_url: '/img/sakura.png',
      },
    ];
    await insertCharacters(charactersToInsert);

    const response = await SELF.fetch('http://localhost/?q=');
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('アリス');
    expect(text).toContain('桜');
  });

  it('検索とソート機能の組み合わせが正常に動作すること', async () => {
    const charactersToInsert: CharacterRecord[] = [
      {
        character_id: 1,
        work_id: 1,
        character_name: 'アリス新',
        work_name: 'ワンダーランド',
        character_image_url: '/img/alice_new.png',
        registration_date: new Date('2024-01-02T10:00:00Z').toISOString(),
      },
      {
        character_id: 2,
        work_id: 2,
        character_name: 'アリス旧',
        work_name: 'ワンダーランド',
        character_image_url: '/img/alice_old.png',
        registration_date: new Date('2024-01-01T10:00:00Z').toISOString(),
      },
      {
        character_id: 3,
        work_id: 3,
        character_name: '桜',
        work_name: '春の物語',
        character_image_url: '/img/sakura.png',
        registration_date: new Date('2024-01-03T10:00:00Z').toISOString(),
      },
    ];
    await insertCharacters(charactersToInsert);

    const response = await SELF.fetch('http://localhost/?q=アリス&sort=newest');
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('アリス新');
    expect(text).toContain('アリス旧');
    expect(text).not.toContain('桜');

    // 新しい順でソートされているか確認
    const newCharIndex = text.indexOf('アリス新');
    const oldCharIndex = text.indexOf('アリス旧');
    expect(newCharIndex).toBeGreaterThan(-1);
    expect(oldCharIndex).toBeGreaterThan(-1);
    expect(newCharIndex).toBeLessThan(oldCharIndex);
  });
});
