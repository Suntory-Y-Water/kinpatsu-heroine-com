import { drizzle } from 'drizzle-orm/d1';
import {
  registrationQueueTable,
  likeHistoryTable,
} from '@/config/drizzle/schema';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from '@/types/error';
import { eq, count, and } from 'drizzle-orm';
import type { CharacterList } from '@/types/character';

export async function getAllCharacters({
  DB,
}: {
  DB: D1Database;
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
        ),
      )
      .groupBy(
        registrationQueueTable.character_id,
        registrationQueueTable.character_name,
        registrationQueueTable.character_image_url,
        registrationQueueTable.work_name,
      );

    const result: CharacterList[] = rawResult.map((row) => ({
      characterId: row.characterId,
      characterName: row.characterName,
      imageUrl: row.imageUrl,
      workName: row.workName || '',
      likes: row.likes || 0,
    }));

    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
