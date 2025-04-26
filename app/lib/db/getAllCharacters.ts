import { drizzle } from 'drizzle-orm/d1';
import {
  characterTable,
  workTable,
  likeHistoryTable,
} from '@/config/drizzle/schema';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from '@/types/error';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
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
        characterId: characterTable.character_id,
        characterName: characterTable.character_name,
        imageUrl: characterTable.character_image_url,
        workName: workTable.work_name,
        likes: sql`COUNT(${likeHistoryTable.character_id})`.as('likes'),
      })
      .from(characterTable)
      .leftJoin(workTable, eq(characterTable.work_id, workTable.work_id))
      .leftJoin(
        likeHistoryTable,
        eq(characterTable.character_id, likeHistoryTable.character_id),
      )
      .groupBy(characterTable.character_id);

    const result: CharacterList[] = rawResult.map((row) => ({
      characterId: row.characterId,
      characterName: row.characterName,
      imageUrl: row.imageUrl,
      workName: row.workName || '',
      likes: Number(row.likes) || 0,
    }));

    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
