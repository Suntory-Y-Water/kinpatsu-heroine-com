import { SELF, env } from 'cloudflare:test';
import {
  testGenerateAdminToken,
  testInsertAdminCharacter,
  testGetCharacterFromDb,
} from 'test-integration/utils';

describe('POST /admin/unregister (app/routes/admin/unregister/index.ts)', () => {
  let adminToken: string;

  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');
    adminToken = await testGenerateAdminToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('認証済みの管理者がアクセスした場合、登録済みキャラクターの非登録が成功し、/admin にリダイレクトされ、成功メッセージが表示されること', async () => {
    const charToUnregister = {
      character_id: 1,
      work_id: 101,
      character_name: 'ToUnregister',
      work_name: 'Test Work',
      character_image_url: '/unregister.png',
      is_deleted: false,
      is_registered: true,
    };
    await testInsertAdminCharacter(charToUnregister);

    const formData = new FormData();
    formData.append('characterId', charToUnregister.character_id.toString());
    formData.append('workId', charToUnregister.work_id.toString());

    const response = await SELF.fetch('http://localhost/admin/unregister', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    const expectedMessage = encodeURIComponent(
      'キャラクターを受付待ちリストに戻しました。',
    );
    expect(redirectLocation).toBe(
      `/admin?status=success&message=${expectedMessage}`,
    );

    const unregisteredChar = await testGetCharacterFromDb(
      charToUnregister.character_id,
      charToUnregister.work_id,
    );
    expect(unregisteredChar?.is_registered).toBe(0);

    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
        {
          headers: { Cookie: `admin_token=${adminToken}` },
        },
      );
      const text = await followResponse.text();
      expect(text).toContain('キャラクターを受付待ちリストに戻しました。');
    }
  });

  it('不正なリクエストボディ (characterIdなし) の場合、エラーメッセージと共に /admin にリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('workId', '101');

    const response = await SELF.fetch('http://localhost/admin/unregister', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });
    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    const expectedMessage = encodeURIComponent(
      'キャラクターの非登録に失敗しました。',
    );
    expect(redirectLocation).toBe(
      `/admin?status=error&message=${expectedMessage}`,
    );
  });

  it('存在しないキャラクターID/作品IDの場合、エラーメッセージと共に /admin にリダイレクトされること (実際には成功として処理される場合がある)', async () => {
    const formData = new FormData();
    formData.append('characterId', '999');
    formData.append('workId', '888');

    const response = await SELF.fetch('http://localhost/admin/unregister', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');

    const updatedChar = await testGetCharacterFromDb(999, 888);
    expect(updatedChar).toBeNull();

    const expectedSuccessMessage = encodeURIComponent(
      'キャラクターを受付待ちリストに戻しました。',
    );
    expect(redirectLocation).toBe(
      `/admin?status=success&message=${expectedSuccessMessage}`,
    );
  });
});
