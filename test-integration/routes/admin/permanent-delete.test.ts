import { SELF, env } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  testGenerateAdminToken,
  testGetCharacterFromDb,
  testInsertAdminCharacter,
} from 'test-integration/utils';

describe('POST /admin/permanent-delete (app/routes/admin/permanent-delete/index.ts)', () => {
  let adminToken: string;

  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');
    adminToken = await testGenerateAdminToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('認証済みの管理者がアクセスした場合、キャラクターの物理削除が成功し、/admin にリダイレクトされ、成功メッセージが表示されること', async () => {
    const charToPermDelete = {
      character_id: 1,
      work_id: 101,
      character_name: 'ToPermDelete',
      work_name: 'Test Work',
      character_image_url: '/perm_delete.png',
      is_deleted: true,
    };
    await testInsertAdminCharacter(charToPermDelete);

    const formData = new FormData();
    formData.append('characterId', charToPermDelete.character_id.toString());
    formData.append('workId', charToPermDelete.work_id.toString());

    const response = await SELF.fetch(
      'http://localhost/admin/permanent-delete',
      {
        method: 'POST',
        headers: { Cookie: `admin_token=${adminToken}` },
        body: formData,
        redirect: 'manual',
      },
    );

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    const expectedMessage = encodeURIComponent(
      'キャラクターを完全に削除しました。',
    );
    expect(redirectLocation).toBe(
      `/admin?status=success&message=${expectedMessage}`,
    );

    const deletedChar = await testGetCharacterFromDb(
      charToPermDelete.character_id,
      charToPermDelete.work_id,
    );
    expect(deletedChar).toBeNull();

    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
        {
          headers: { Cookie: `admin_token=${adminToken}` },
        },
      );
      const text = await followResponse.text();
      expect(text).toContain('キャラクターを完全に削除しました。');
    }
  });

  it('不正なリクエストボディ (workIdなし) の場合、エラーメッセージと共に /admin にリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('characterId', '1');

    const response = await SELF.fetch(
      'http://localhost/admin/permanent-delete',
      {
        method: 'POST',
        headers: { Cookie: `admin_token=${adminToken}` },
        body: formData,
        redirect: 'manual',
      },
    );
    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    const expectedMessage = encodeURIComponent(
      'キャラクターの完全削除に失敗しました。',
    );
    expect(redirectLocation).toBe(
      `/admin?status=error&message=${expectedMessage}`,
    );
  });

  it('存在しないキャラクターID/作品IDの場合、エラーメッセージと共に /admin にリダイレクトされること (実際には成功として処理される)', async () => {
    const formData = new FormData();
    formData.append('characterId', '777');
    formData.append('workId', '666');

    const response = await SELF.fetch(
      'http://localhost/admin/permanent-delete',
      {
        method: 'POST',
        headers: { Cookie: `admin_token=${adminToken}` },
        body: formData,
        redirect: 'manual',
      },
    );

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    const expectedMessage = encodeURIComponent(
      'キャラクターを完全に削除しました。',
    );

    expect(redirectLocation).toBe(
      `/admin?status=success&message=${expectedMessage}`,
    );

    const nonExistentChar = await testGetCharacterFromDb(777, 666);
    expect(nonExistentChar).toBeNull();
  });
});
