import { SELF, env } from 'cloudflare:test';
import {
  testGenerateAdminToken,
  testGetCharacterFromDb,
  testInsertAdminCharacter,
} from 'test-integration/utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('POST /admin/delete (app/routes/admin/delete/index.ts)', () => {
  let adminToken: string;

  beforeEach(async () => {
    await env.DB.exec('DELETE FROM registration_queue_table;');
    adminToken = await testGenerateAdminToken();
  });

  it('認証済みの管理者がアクセスした場合、キャラクターの論理削除が成功し、/admin にリダイレクトされ、成功メッセージが表示されること', async () => {
    const charToDelete = {
      character_id: 1,
      work_id: 101,
      character_name: 'ToDelete',
      work_name: 'Test Work',
      character_image_url: '/delete.png',
      is_deleted: false,
    };
    await testInsertAdminCharacter(charToDelete);

    const formData = new FormData();
    formData.append('characterId', charToDelete.character_id.toString());
    formData.append('workId', charToDelete.work_id.toString());

    const response = await SELF.fetch('http://localhost/admin/delete', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin?status=success&message=');

    const updatedChar = await testGetCharacterFromDb(
      charToDelete.character_id,
      charToDelete.work_id,
    );
    expect(updatedChar?.is_deleted).toBe(1);

    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
        {
          headers: { Cookie: `admin_token=${adminToken}` },
        },
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent('キャラクターの削除に成功しました。'),
      );
    }
  });

  it('不正なリクエストボディ (characterIdなし) の場合、エラーメッセージと共に /admin にリダイレクトされること', async () => {
    const formData = new FormData();
    formData.append('workId', '101');

    const response = await SELF.fetch('http://localhost/admin/delete', {
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
        decodeURIComponent('キャラクターの削除に失敗しました。'),
      );
    }
  });

  it('存在しないキャラクターID/作品IDの場合、エラーメッセージと共に /admin にリダイレクトされること (または適切に処理されること)', async () => {
    const formData = new FormData();
    formData.append('characterId', '999');
    formData.append('workId', '888');

    const response = await SELF.fetch('http://localhost/admin/delete', {
      method: 'POST',
      headers: { Cookie: `admin_token=${adminToken}` },
      body: formData,
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    const redirectLocation = response.headers.get('Location');
    expect(redirectLocation).toContain('/admin?status=success&message=');

    if (redirectLocation) {
      const followResponse = await SELF.fetch(
        `http://localhost${redirectLocation}`,
        {
          headers: { Cookie: `admin_token=${adminToken}` },
        },
      );
      const text = await followResponse.text();
      expect(text).toContain(
        decodeURIComponent('キャラクターの削除に成功しました。'),
      );
    }
    const nonExistentChar = await testGetCharacterFromDb(999, 888);
    expect(nonExistentChar).toBeNull();
  });

  it('DB更新エラー発生時に、エラーメッセージと共に /admin にリダイレクトされること', async () => {
    const charToDelete = {
      character_id: 1,
      work_id: 101,
      character_name: 'ToDelete',
      work_name: 'Test Work',
      character_image_url: '/delete.png',
    };
    await testInsertAdminCharacter(charToDelete);

    const formData = new FormData();
    formData.append('characterId', charToDelete.character_id.toString());
    formData.append('workId', charToDelete.work_id.toString());

    const mockError = new Error('Simulated DB Update Error');
    const prepareSpy = vi.spyOn(env.DB, 'prepare');
    const mockStatement = {
      bind: vi.fn().mockReturnThis(),
      run: vi.fn().mockRejectedValue(mockError),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockImplementation(async () => {
        throw mockError;
      }),
    };
    prepareSpy.mockImplementation((sql: string) => {
      if (sql.toLowerCase().startsWith('update registration_queue_table')) {
        return mockStatement as any;
      }
      return env.DB.prepare(sql); //  vitest.setup.ts のため
    });

    const response = await SELF.fetch('http://localhost/admin/delete', {
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
      // リダイレクトしたあとにグローバルの500エラーが発生して
      // 通信エラーが発生しました。が表示される。
      const text = await followResponse.text();
      expect(text).toContain(decodeURIComponent('通信エラーが発生しました。'));
    }
    prepareSpy.mockRestore();
  });
});
