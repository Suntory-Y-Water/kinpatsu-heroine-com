import { drizzle } from 'drizzle-orm/d1';
import { likeHistoryTable } from '@/config/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { err, ok } from 'neverthrow';

/**
 * @description 指定されたキャラクターIDに対するいいねの有無を取得する
 * @param {D1Database} DB - D1Databaseインスタンス
 * @param {number} characterId - キャラクターID
 * @param {string} cookieId - クッキーID
 * @returns {Promise<boolean>} いいねの有無
 */
export async function getLikeCharacterById({
  DB,
  characterId,
  cookieId,
}: {
  DB: D1Database;
  characterId: number;
  cookieId: string;
}) {
  try {
    const db = drizzle(DB);

    // いいねの有無を確認
    const existingLike = await db
      .select()
      .from(likeHistoryTable)
      .where(
        and(
          eq(likeHistoryTable.character_id, characterId),
          eq(likeHistoryTable.cookie_id, cookieId),
        ),
      )
      .limit(1);

    const isLiked = existingLike.length > 0;

    return ok(isLiked);
  } catch (error) {
    // エラーの場合はいいねしていないとみなす
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(message);
    console.error(error);
    return err(false);
  }
}
