// テスト用のユーティリティ関数
import { env } from 'cloudflare:test';
import { sign } from 'hono/jwt';

export async function testGenerateAdminToken(): Promise<string> {
  return await sign(
    {
      role: 'admin',
      username: 'test_admin_user',
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
    },
    env.JWT_SECRET,
  );
}

type AdminCharacterRecord = {
  character_id: number;
  work_id: number;
  character_name: string;
  work_name: string;
  character_image_url: string;
  is_registered?: boolean;
  is_deleted?: boolean;
  registration_date?: string;
};

export async function testInsertAdminCharacter(
  character: AdminCharacterRecord,
) {
  const {
    character_id,
    work_id,
    character_name,
    work_name,
    character_image_url,
    is_registered = false,
    is_deleted = false,
    registration_date = new Date().toISOString(),
  } = character;
  await env.DB.prepare(
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
  )
    .bind(
      character_id,
      work_id,
      character_name,
      work_name,
      character_image_url,
      registration_date,
      is_registered ? 1 : 0,
      is_deleted ? 1 : 0,
    )
    .run();
}

export async function testGetCharacterFromDb(
  characterId: number,
  workId: number,
): Promise<AdminCharacterRecord | null> {
  const result = await env.DB.prepare(
    'SELECT * FROM registration_queue_table WHERE character_id = ? AND work_id = ?',
  )
    .bind(characterId, workId)
    .first<AdminCharacterRecord>();
  return result;
}

export function createMockAnnictResponse() {
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Test Work</title></head>
    <body>
      <a href="https://example.com/official">公式サイト</a>
      <a href="https://ja.wikipedia.org/wiki/Test_Work">Wikipedia</a>
      <ul>
        <li><a href="https://www.netflix.com/test">Netflix</a></li>
        <li><a href="https://amazon.com/test">Amazon Prime Video</a></li>
      </ul>
    </body>
    </html>
  `;
}

export function createEmptyAnnictResponse() {
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Empty Work</title></head>
    <body>
      <p>No links found</p>
    </body>
    </html>
  `;
}

export async function testGetWorkFromDb(workId: number) {
  const result = await env.DB.prepare(
    'SELECT * FROM work_table WHERE work_id = ?',
  )
    .bind(workId)
    .first();
  return result;
}

export async function testGetStreamingSiteFromDb(streamingSiteId: string) {
  const result = await env.DB.prepare(
    'SELECT * FROM streaming_site_table WHERE streaming_site_id = ?',
  )
    .bind(streamingSiteId)
    .first();
  return result;
}

export async function testGetWorkStreamingSiteFromDb(
  workId: number,
  streamingSiteId: string,
) {
  const result = await env.DB.prepare(
    'SELECT * FROM work_streaming_site_table WHERE work_id = ? AND streaming_site_id = ?',
  )
    .bind(workId, streamingSiteId)
    .first();
  return result;
}

export async function testGetCharacterFromCharacterTable(characterId: number) {
  const result = await env.DB.prepare(
    'SELECT * FROM character_table WHERE character_id = ?',
  )
    .bind(characterId)
    .first();
  return result;
}
