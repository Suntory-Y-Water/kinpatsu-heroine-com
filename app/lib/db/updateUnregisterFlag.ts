import { drizzle } from 'drizzle-orm/d1';
import { registrationQueueTable } from '@/config/drizzle/schema';
import { ok, Result } from 'neverthrow';
import { DatabaseError, databaseErrorHandler } from '@/types/error';
import { and, eq } from 'drizzle-orm';

/**
 * 登録済みキャラクターを非登録状態に更新する関数
 * @param DB D1データベースインスタンス
 * @param characterId キャラクターID
 * @param workId 作品ID
 * @returns 処理結果
 */
export async function updateUnregisterFlag({
  DB,
  characterId,
  workId,
}: {
  DB: D1Database;
  characterId: number;
  workId: number;
}): Promise<Result<void, DatabaseError>> {
  try {
    const db = drizzle(DB);

    await db
      .update(registrationQueueTable)
      .set({
        is_registered: false,
      })
      .where(
        and(
          eq(registrationQueueTable.character_id, characterId),
          eq(registrationQueueTable.work_id, workId),
        ),
      );

    return ok(undefined);
  } catch (error) {
    return databaseErrorHandler(error);
  }
}