import { drizzle } from 'drizzle-orm/d1';
import {
  registrationQueueTable,
  likeHistoryTable,
} from '@/config/drizzle/schema';
import { ok, Result } from 'neverthrow';
import { DatabaseError, databaseErrorHandler } from '@/types/error';
import { eq, count, and, desc, like } from 'drizzle-orm';
import type { CharacterList } from '@/types/character';

/**
 * 登録済みキャラクターの一覧を取得します
 * @param DB - D1データベースインスタンス
 * @param searchQuery - キャラクター名の検索クエリ（部分一致）
 * @returns 登録済みキャラクターの一覧
 */
export async function getAllCharacters({
  DB,
  searchQuery,
}: {
  DB: D1Database;
  searchQuery?: string;
}): Promise<Result<CharacterList[], DatabaseError>> {
  try {
    const db = drizzle(DB);

    const rawResult = await db
      .select({
        characterId: registrationQueueTable.character_id,
        characterName: registrationQueueTable.character_name,
        imageUrl: registrationQueueTable.character_image_url,
        workName: registrationQueueTable.work_name,
        likes: count(likeHistoryTable.character_id).as('likes'),
      })
      .from(registrationQueueTable)
      .leftJoin(
        likeHistoryTable,
        eq(registrationQueueTable.character_id, likeHistoryTable.character_id),
      )
      .where(
        and(
          eq(registrationQueueTable.is_deleted, false),
          eq(registrationQueueTable.is_registered, true),
          searchQuery ? like(registrationQueueTable.character_name, `%${searchQuery}%`) : undefined,
        ),
      )
      .groupBy(
        registrationQueueTable.character_id,
        registrationQueueTable.character_name,
        registrationQueueTable.character_image_url,
        registrationQueueTable.work_name,
      )
      .orderBy(desc(registrationQueueTable.registration_date));

    const result: CharacterList[] = rawResult.map((row) => ({
      characterId: row.characterId,
      characterName: row.characterName,
      imageUrl: row.imageUrl,
      workName: row.workName || '',
      likes: row.likes || 0,
    }));

    return ok(result);
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
