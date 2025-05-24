import { SELF, env } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  testGenerateAdminToken,
  testInsertAdminCharacter,
  testGetCharacterFromDb,
  createMockAnnictResponse,
  createEmptyAnnictResponse,
  testGetWorkFromDb,
  testGetStreamingSiteFromDb,
  testGetWorkStreamingSiteFromDb,
  testGetCharacterFromCharacterTable,
} from 'test-integration/utils';

describe('POST /admin/register (app/routes/admin/register/index.ts)', () => {
  let adminToken: string;
  let originalFetch: typeof global.fetch;

  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');
    await env.DB.exec('DELETE FROM work_table;');
    await env.DB.exec('DELETE FROM character_table;');
    await env.DB.exec('DELETE FROM streaming_site_table;');
    await env.DB.exec('DELETE FROM work_streaming_site_table;');
    adminToken = await testGenerateAdminToken();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('認証済みの管理者がアクセスした場合、キャラクター情報の登録、関連情報の取得・登録が成功し、/admin にリダイレクトされること', async () => {
    const testCharacter = {
      character_id: 1,
      work_id: 101,
      character_name: 'Test Character',
      work_name: 'Test Work',
      character_image_url: '/test.png',
      is_registered: false,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    global.fetch = vi.fn().mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('annict.com/works/101')) {
        return Promise.resolve(
          new Response(createMockAnnictResponse(), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }),
        );
      }
      return originalFetch(url);
    });

    const formData = new FormData();
    formData.append('characterId', testCharacter.character_id.toString());
    formData.append('workId', testCharacter.work_id.toString());
    formData.append('characterName', testCharacter.character_name);
    formData.append('workName', testCharacter.work_name);
    formData.append('imageUrl', testCharacter.character_image_url);

    const response = await SELF.fetch('http://localhost/admin/register', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin?status=success&message=');

    const updatedChar = await testGetCharacterFromDb(
      testCharacter.character_id,
      testCharacter.work_id,
    );
    expect(updatedChar?.is_registered).toBe(1);

    const workRecord = await testGetWorkFromDb(testCharacter.work_id);
    expect(workRecord).toBeTruthy();
    expect(workRecord?.official_site_url).toBe('https://example.com/official');
    expect(workRecord?.wikipedia_url).toBe(
      'https://ja.wikipedia.org/wiki/Test_Work',
    );

    const characterRecord = await testGetCharacterFromCharacterTable(
      testCharacter.character_id,
    );
    expect(characterRecord).toBeTruthy();
    expect(characterRecord?.work_id).toBe(testCharacter.work_id);

    const netflixSite = await testGetStreamingSiteFromDb('www.netflix.com');
    expect(netflixSite).toBeTruthy();
    expect(netflixSite?.streaming_site_name).toBe('Netflix');

    const amazonSite = await testGetStreamingSiteFromDb('amazon.com');
    expect(amazonSite).toBeTruthy();
    expect(amazonSite?.streaming_site_name).toBe('Amazon Prime Video');

    const workNetflixRelation = await testGetWorkStreamingSiteFromDb(
      testCharacter.work_id,
      'www.netflix.com',
    );
    expect(workNetflixRelation).toBeTruthy();
    expect(workNetflixRelation?.streaming_site_url).toBe(
      'https://www.netflix.com/test',
    );

    const workAmazonRelation = await testGetWorkStreamingSiteFromDb(
      testCharacter.work_id,
      'amazon.com',
    );
    expect(workAmazonRelation).toBeTruthy();
    expect(workAmazonRelation?.streaming_site_url).toBe(
      'https://amazon.com/test',
    );

    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
        {
          headers: { Cookie: `admin_token=${adminToken}` },
        },
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent('キャラクターの登録に成功しました。'),
      );
    }
  });

  it('不正なリクエストボディ (characterIdなし) の場合、エラーメッセージと共に /admin にリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('workId', '101');
    formData.append('characterName', 'Test Character');
    formData.append('workName', 'Test Work');
    formData.append('imageUrl', '/test.png');

    const response = await SELF.fetch('http://localhost/admin/register', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin?status=error&message=');

    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
        {
          headers: { Cookie: `admin_token=${adminToken}` },
        },
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent('キャラクターの登録に失敗しました。'),
      );
    }
  });

  it('Annict API から作品詳細情報を取得できない場合、エラーメッセージと共に /admin にリダイレクトされること', async () => {
    const testCharacter = {
      character_id: 1,
      work_id: 101,
      character_name: 'Test Character',
      work_name: 'Test Work',
      character_image_url: '/test.png',
      is_registered: false,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(new Response('Not Found', { status: 404 }));
    });

    const formData = new FormData();
    formData.append('characterId', testCharacter.character_id.toString());
    formData.append('workId', testCharacter.work_id.toString());
    formData.append('characterName', testCharacter.character_name);
    formData.append('workName', testCharacter.work_name);
    formData.append('imageUrl', testCharacter.character_image_url);

    const response = await SELF.fetch('http://localhost/admin/register', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin?status=error&message=');

    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
        {
          headers: { Cookie: `admin_token=${adminToken}` },
        },
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent('キャラクターの登録に失敗しました。'),
      );
    }
  });

  it('配信サイト情報が存在しない作品の場合でも、作品情報とキャラクター情報の登録が成功すること', async () => {
    const testCharacter = {
      character_id: 1,
      work_id: 102,
      character_name: 'Test Character 2',
      work_name: 'Test Work 2',
      character_image_url: '/test2.png',
      is_registered: false,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    global.fetch = vi.fn().mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('annict.com/works/102')) {
        return Promise.resolve(
          new Response(createEmptyAnnictResponse(), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }),
        );
      }
      return originalFetch(url);
    });

    const formData = new FormData();
    formData.append('characterId', testCharacter.character_id.toString());
    formData.append('workId', testCharacter.work_id.toString());
    formData.append('characterName', testCharacter.character_name);
    formData.append('workName', testCharacter.work_name);
    formData.append('imageUrl', testCharacter.character_image_url);

    const response = await SELF.fetch('http://localhost/admin/register', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin?status=success&message=');

    const workRecord = await testGetWorkFromDb(testCharacter.work_id);
    expect(workRecord).toBeTruthy();
    expect(workRecord?.official_site_url).toBe('');
    expect(workRecord?.wikipedia_url).toBe('');

    const characterRecord = await testGetCharacterFromCharacterTable(
      testCharacter.character_id,
    );
    expect(characterRecord).toBeTruthy();

    const updatedChar = await testGetCharacterFromDb(
      testCharacter.character_id,
      testCharacter.work_id,
    );
    expect(updatedChar?.is_registered).toBe(1);
  });

  it('既に登録済みの作品に対して新しいキャラクターを追加する場合、作品情報が更新され、新しいキャラクター情報が登録されること', async () => {
    const existingWork = {
      work_id: 103,
      official_site_url: 'https://old-site.com',
      wikipedia_url: 'https://old-wiki.com',
    };
    await env.DB.prepare(
      'INSERT INTO work_table (work_id, official_site_url, wikipedia_url) VALUES (?, ?, ?)',
    )
      .bind(
        existingWork.work_id,
        existingWork.official_site_url,
        existingWork.wikipedia_url,
      )
      .run();

    const newCharacter = {
      character_id: 2,
      work_id: 103,
      character_name: 'New Character',
      work_name: 'Existing Work',
      character_image_url: '/new.png',
      is_registered: false,
      is_deleted: false,
    };
    await testInsertAdminCharacter(newCharacter);

    global.fetch = vi.fn().mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('annict.com/works/103')) {
        return Promise.resolve(
          new Response(createMockAnnictResponse(), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }),
        );
      }
      return originalFetch(url);
    });

    const formData = new FormData();
    formData.append('characterId', newCharacter.character_id.toString());
    formData.append('workId', newCharacter.work_id.toString());
    formData.append('characterName', newCharacter.character_name);
    formData.append('workName', newCharacter.work_name);
    formData.append('imageUrl', newCharacter.character_image_url);

    const response = await SELF.fetch('http://localhost/admin/register', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin?status=success&message=');

    const updatedWork = await testGetWorkFromDb(newCharacter.work_id);
    expect(updatedWork?.official_site_url).toBe('https://example.com/official');
    expect(updatedWork?.wikipedia_url).toBe(
      'https://ja.wikipedia.org/wiki/Test_Work',
    );

    const characterRecord = await testGetCharacterFromCharacterTable(
      newCharacter.character_id,
    );
    expect(characterRecord).toBeTruthy();
    expect(characterRecord?.work_id).toBe(newCharacter.work_id);

    const updatedChar = await testGetCharacterFromDb(
      newCharacter.character_id,
      newCharacter.work_id,
    );
    expect(updatedChar?.is_registered).toBe(1);
  });

  it('DB更新エラー発生時に、エラーメッセージと共に /admin にリダイレクトされること', async () => {
    const testCharacter = {
      character_id: 1,
      work_id: 101,
      character_name: 'Test Character',
      work_name: 'Test Work',
      character_image_url: '/test.png',
      is_registered: false,
      is_deleted: false,
    };
    await testInsertAdminCharacter(testCharacter);

    global.fetch = vi.fn().mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('annict.com/works/101')) {
        return Promise.resolve(
          new Response(createMockAnnictResponse(), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }),
        );
      }
      return originalFetch(url);
    });

    const mockError = new Error('Simulated DB Error');
    const prepareSpy = vi.spyOn(env.DB, 'prepare');
    const mockStatement = {
      bind: vi.fn().mockReturnThis(),
      run: vi.fn().mockRejectedValue(mockError),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockImplementation(async () => {
        throw mockError;
      }),
    };
    prepareSpy.mockImplementation((sql: string) => {
      if (sql.toLowerCase().includes('insert into work_table')) {
        return mockStatement as any;
      }
      return env.DB.prepare(sql);
    });

    const formData = new FormData();
    formData.append('characterId', testCharacter.character_id.toString());
    formData.append('workId', testCharacter.work_id.toString());
    formData.append('characterName', testCharacter.character_name);
    formData.append('workName', testCharacter.work_name);
    formData.append('imageUrl', testCharacter.character_image_url);

    const response = await SELF.fetch('http://localhost/admin/register', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin?status=error&message=');

    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
        {
          headers: { Cookie: `admin_token=${adminToken}` },
        },
      );
      const text = await followResponse.text();
      expect(text).toContain(decodeURIComponent('通信エラーが発生しました'));
    }

    prepareSpy.mockRestore();
  });
});
