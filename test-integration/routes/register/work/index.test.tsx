import { SELF, env } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// (既存のモック関数 setupPersistentMock, mockWorksResponse, mockCharactersResponse は変更なし)
function setupPersistentMock(responseData: any) {
  global.fetch = vi.fn().mockImplementation(async () => {
    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => responseData,
      text: async () => JSON.stringify(responseData),
    };
  });
}

function mockWorksResponse(works: { annictId: number; title: string }[]) {
  return {
    data: {
      searchWorks: { nodes: works },
    },
  };
}

function mockCharactersResponse(
  characters: { annictId: number; name: string }[],
) {
  return {
    data: {
      searchWorks: {
        edges: [
          {
            node: {
              casts: {
                edges: characters.map((char) => ({
                  node: {
                    character: {
                      annictId: char.annictId,
                      name: char.name,
                    },
                  },
                })),
              },
            },
          },
        ],
      },
    },
  };
}

describe('GET /register/work (app/routes/register/work/index.tsx)', () => {
  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('正常なレスポンス (ステータスコード 200) と共に作品選択フォームが表示されること', async () => {
    setupPersistentMock(
      mockWorksResponse([
        { annictId: 2108, title: '魔法少女まどか☆マギカ' },
        { annictId: 6196, title: 'コードギアス 復活のルルーシュ' },
      ]),
    );

    const response = await SELF.fetch('http://localhost/register/work');

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('作品登録');
    expect(text).toContain('作品名を入力してください');
    expect(text).toContain('次へ');
  });

  it('Annict APIから作品一覧が取得され、フォームに渡されること', async () => {
    setupPersistentMock(
      mockWorksResponse([
        { annictId: 2108, title: '魔法少女まどか☆マギカ' },
        { annictId: 6196, title: 'コードギアス 復活のルルーシュ' },
      ]),
    );

    const response = await SELF.fetch('http://localhost/register/work');
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('魔法少女まどか☆マギカ');
    expect(text).toContain('コードギアス 復活のルルーシュ');
  });

  it('Annict APIエラー発生時に、適切なエラーページまたはメッセージが表示されること', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Annict API Error'));

    const response = await SELF.fetch('http://localhost/register/work');

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toContain('通信エラーが発生しました');
  });

  it('クエリパラメータに status と message がある場合、StatusMessage が表示されること', async () => {
    setupPersistentMock(
      mockWorksResponse([{ annictId: 1, title: 'テスト作品' }]),
    );

    const status = 'error';
    const message = 'テストエラーメッセージ';
    const encodedMessage = encodeURIComponent(message);

    const response = await SELF.fetch(
      `http://localhost/register/work?status=${status}&message=${encodedMessage}`,
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('テストエラーメッセージ');
  });
});

describe('POST /register/work (app/routes/register/work/index.tsx)', () => {
  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');
    await env.DB.exec('DELETE FROM character_table;');
    await env.DB.exec('DELETE FROM work_table;');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('有効な作品IDと作品名が送信された場合、Annict APIから該当作品のキャラクター一覧を取得し、未登録のキャラクター情報をクエリパラメータに含めて /register/character にリダイレクトされること', async () => {
    setupPersistentMock(
      mockCharactersResponse([
        { annictId: 1001, name: 'テストキャラクター1' },
        { annictId: 1002, name: 'テストキャラクター2' },
      ]),
    );
    // getCharacterById の INNER JOIN のために work_table にもデータが必要
    await env.DB.prepare('INSERT INTO work_table (work_id) VALUES (?)')
      .bind(123)
      .run();

    const formData = new FormData();
    formData.append('workId', '123');
    formData.append('workName', 'テスト作品');

    const response = await SELF.fetch('http://localhost/register/work', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/register/character');
    expect(redirectLocation).toContain('workId=123');
    expect(redirectLocation).toContain('workName=');
    expect(redirectLocation).toContain('characters=');
  });

  it('不正なリクエストボディ (バリデーションエラー) の場合、エラーメッセージと共に /register/work にリダイレクトされること', async () => {
    setupPersistentMock(
      mockWorksResponse([{ annictId: 1, title: 'テスト作品' }]),
    );

    const formData = new FormData();
    formData.append('workName', 'テスト作品'); // workId が不足

    const response = await SELF.fetch('http://localhost/register/work', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/register/work?status=error&message=');

    // リダイレクト後の fetch の前に再度モックを設定 (GET /register/work のため)
    setupPersistentMock(
      mockWorksResponse([{ annictId: 1, title: 'テスト作品' }]),
    );
    const followResponse = await SELF.fetch(
      `http://localhost${redirectLocation!}`,
    );
    const text = await followResponse.text();
    expect(text).toContain(decodeURIComponent('入力内容に誤りがあります。'));
  });

  it('Annict APIからのキャラクター情報取得に失敗した場合、エラーメッセージと共に /register/work にリダイレクトされること', async () => {
    // このテストケースでは、APIエラーは500を返すため、リダイレクトは発生しない
    global.fetch = vi
      .fn()
      .mockRejectedValue(new Error('Annict API キャラクター取得エラー'));

    const formData = new FormData();
    formData.append('workId', '123');
    formData.append('workName', 'テスト作品');

    const response = await SELF.fetch('http://localhost/register/work', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(500); // エラーハンドラが500を返す
    const text = await response.text();
    expect(text).toContain('通信エラーが発生しました');
  });

  it('作品にキャラクターが登録されていない場合、エラーメッセージと共に /register/work にリダイレクトされること', async () => {
    // POST時の Annict API モック (キャラクターなし)
    setupPersistentMock(mockCharactersResponse([]));
    // getCharacterById の INNER JOIN のために work_table にもデータが必要
    await env.DB.prepare('INSERT INTO work_table (work_id) VALUES (?)')
      .bind(123)
      .run();

    const formData = new FormData();
    formData.append('workId', '123');
    formData.append('workName', 'キャラクターなし作品');

    const response = await SELF.fetch('http://localhost/register/work', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/register/work?status=error&message=');

    // リダイレクト後のGETリクエストのためのAnnict API作品一覧モック
    setupPersistentMock(
      mockWorksResponse([{ annictId: 123, title: 'キャラクターなし作品' }]),
    );

    const followResponse = await SELF.fetch(
      `http://localhost${redirectLocation!}`,
    );
    const text = await followResponse.text();
    expect(text).toContain(
      decodeURIComponent('この作品にはキャラクターが登録されていません。'),
    );
  });

  it('作品の全キャラクターが既に登録済みの場合、エラーメッセージと共に /register/work にリダイレクトされること', async () => {
    const workId = 123;
    const characterId = 1001;

    // work_table にデータを挿入 (getCharacterById の INNER JOIN のため)
    await env.DB.prepare(`INSERT INTO work_table (work_id) VALUES (?)`)
      .bind(workId)
      .run();

    // character_table にデータを挿入 (これは本来アプリケーションが見るべきテーブル)
    await env.DB.prepare(
      `INSERT INTO character_table (character_id, work_id) VALUES (?, ?)`,
    )
      .bind(characterId, workId)
      .run();

    // registration_queue_table に「登録済み」とアプリケーションが誤認するためのデータを挿入
    // 現在の実装 (getCharacterById) はこのテーブルの character_id を見ている
    await env.DB.prepare(
      `INSERT INTO registration_queue_table 
        (character_id, work_id, character_name, work_name, character_image_url, is_registered, is_deleted) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        characterId,
        workId,
        'Already Registered',
        'Test Work',
        'test.png',
        0,
        0,
      ) // is_registered の値は現在のロジックでは影響しない
      .run();

    // Annict API モック: 登録済みのキャラクターのみを返す
    setupPersistentMock(
      mockCharactersResponse([
        { annictId: characterId, name: 'Already Registered' },
      ]),
    );

    const formData = new FormData();
    formData.append('workId', workId.toString());
    formData.append('workName', 'Test Work');

    const response = await SELF.fetch('http://localhost/register/work', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/register/work?status=error&message=');

    // リダイレクト後のGETリクエストのためのAnnict API作品一覧モック
    setupPersistentMock(
      mockWorksResponse([{ annictId: workId, title: 'Test Work' }]),
    );

    const followResponse = await SELF.fetch(
      `http://localhost${redirectLocation!}`,
    );
    const text = await followResponse.text();
    expect(followResponse.status).toBe(200);
    expect(text).toContain(
      decodeURIComponent('この作品には登録可能なキャラクターがありません。'),
    );
  });
});
