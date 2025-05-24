import { SELF, env } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('GET /register/character (app/routes/register/character/index.tsx)', () => {
  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');

    // fetchのモック化
    global.fetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          data: {
            searchWorks: {
              nodes: [
                {
                  annictId: 2108,
                  title: '魔法少女まどか☆マギカ',
                },
                {
                  annictId: 6196,
                  title: 'コードギアス 復活のルルーシュ',
                },
              ],
            },
          },
        }),
        text: async () =>
          JSON.stringify({
            data: {
              searchWorks: {
                nodes: [
                  {
                    annictId: 2108,
                    title: '魔法少女まどか☆マギカ',
                  },
                  {
                    annictId: 6196,
                    title: 'コードギアス 復活のルルーシュ',
                  },
                ],
              },
            },
          }),
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('有効なクエリパラメータ (workId, workName, characters) が指定された場合、キャラクター登録フォームが正常に表示されること', async () => {
    const workId = '123';
    const workName = '魔法少女まどか☆マギカ';
    const characters = JSON.stringify([
      { annictId: 1, name: '鹿目まどか' },
      { annictId: 2, name: '巴マミ' },
    ]);

    const response = await SELF.fetch(
      `http://localhost/register/character?workId=${workId}&workName=${encodeURIComponent(workName)}&characters=${encodeURIComponent(characters)}`,
    );

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('キャラクター登録');
    expect(text).toContain(workName);
    expect(text).toContain('鹿目まどか');
    expect(text).toContain('巴マミ');
  });

  it('必要なクエリパラメータが不足している場合、エラーメッセージと共に /register/work にリダイレクトされること', async () => {
    const response = await SELF.fetch(
      'http://localhost/register/character?workId=123',
      { redirect: 'manual' },
    );

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/register/work?status=error&message=');
    const decodedLocation = decodeURIComponent(redirectLocation || '');
    expect(decodedLocation).toContain(
      'キャラクター登録画面の表示に必要な情報が不足しています。',
    );
  });

  it('characters クエリパラメータが不正なJSON形式の場合、エラーメッセージと共に /register/work にリダイレクトされること', async () => {
    const workId = '123';
    const workName = '魔法少女まどか☆マギカ';
    const invalidCharacters = 'invalid-json-format';

    const response = await SELF.fetch(
      `http://localhost/register/character?workId=${workId}&workName=${encodeURIComponent(workName)}&characters=${invalidCharacters}`,
      { redirect: 'manual' },
    );

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/register/work?status=error&message=');
    const decodedLocation = decodeURIComponent(redirectLocation || '');
    expect(decodedLocation).toContain(
      'キャラクター情報の読み込みに失敗しました。',
    );
  });

  it('characters クエリパラメータのデータ構造が不正な場合 (Zodバリデーションエラー)、エラーメッセージと共に / にリダイレクトされること', async () => {
    const workId = '123';
    const workName = '魔法少女まどか☆マギカ';
    const invalidStructureCharacters = JSON.stringify([
      { invalidField: 'invalid' },
      { annictId: 'not-a-number', name: 123 },
    ]);

    const response = await SELF.fetch(
      `http://localhost/register/character?workId=${workId}&workName=${encodeURIComponent(workName)}&characters=${encodeURIComponent(invalidStructureCharacters)}`,
      { redirect: 'manual' },
    );

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/?status=error&message=');
    const decodedLocation = decodeURIComponent(redirectLocation || '');
    expect(decodedLocation).toContain('キャラクター情報の形式が不正です。');
  });

  it('charactersQuery が空の場合、エラーメッセージと共に /register/work にリダイレクトされること', async () => {
    const workId = '123';
    const workName = '魔法少女まどか☆マギカ';

    const response = await SELF.fetch(
      `http://localhost/register/character?workId=${workId}&workName=${encodeURIComponent(workName)}&characters=`,
      { redirect: 'manual' },
    );

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/register/work?status=error&message=');
    const decodedLocation = decodeURIComponent(redirectLocation || '');
    expect(decodedLocation).toContain(
      'キャラクター登録画面の表示に必要な情報が不足しています。',
    );
  });
});

describe('POST /register/character (app/routes/register/character/index.tsx)', () => {
  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');

    // fetchのモック化
    global.fetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          data: {
            searchWorks: {
              nodes: [
                {
                  annictId: 2108,
                  title: '魔法少女まどか☆マギカ',
                },
                {
                  annictId: 6196,
                  title: 'コードギアス 復活のルルーシュ',
                },
              ],
            },
          },
        }),
        text: async () =>
          JSON.stringify({
            data: {
              searchWorks: {
                nodes: [
                  {
                    annictId: 2108,
                    title: '魔法少女まどか☆マギカ',
                  },
                  {
                    annictId: 6196,
                    title: 'コードギアス 復活のルルーシュ',
                  },
                ],
              },
            },
          }),
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('有効なキャラクター情報と画像URLが送信された場合、registration_queue_table にキャラクター情報が登録され、成功メッセージと共に / にリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('characterId', '1');
    formData.append('characterName', '鹿目まどか');
    formData.append('workId', '123');
    formData.append('workName', '魔法少女まどか☆マギカ');
    formData.append('imageUrl', 'https://example.com/madoka.jpg');

    const response = await SELF.fetch('http://localhost/register/character', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/?status=success&message=');

    const insertedChar = await env.DB.prepare(
      'SELECT * FROM registration_queue_table WHERE character_id = ? AND work_id = ?',
    )
      .bind(1, 123)
      .first();

    expect(insertedChar).not.toBeNull();
    expect(insertedChar?.character_name).toBe('鹿目まどか');
    expect(insertedChar?.work_name).toBe('魔法少女まどか☆マギカ');
    expect(insertedChar?.character_image_url).toBe(
      'https://example.com/madoka.jpg',
    );
    expect(insertedChar?.is_registered).toBe(0);
    expect(insertedChar?.is_deleted).toBe(0);
  });

  it('不正なリクエストボディ (バリデーションエラー) の場合、エラーメッセージと共に /register/work にリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('characterId', '');
    formData.append('characterName', '');
    formData.append('workId', 'invalid');
    formData.append('workName', '');
    formData.append('imageUrl', '');

    const response = await SELF.fetch('http://localhost/register/character', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(303);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/register/work?status=error&message=');
    const decodedLocation = decodeURIComponent(redirectLocation || '');
    expect(decodedLocation).toContain('入力内容に誤りがあります。');

    const insertedChar = await env.DB.prepare(
      'SELECT * FROM registration_queue_table',
    ).all();
    expect(insertedChar.results.length).toBe(0);
  });
});
