import { characterTable } from '@/config/drizzle/schema';
import { CharacterInfo } from '@/types/character';
import { DatabaseError, databaseErrorHandler } from '@/types/error';
import { drizzle } from 'drizzle-orm/d1';
import { ok, Result } from 'neverthrow';

export async function createCharacter({
  DB,
  character,
}: {
  DB: D1Database;
  character: CharacterInfo;
}): Promise<Result<void, DatabaseError>> {
  try {
    const db = drizzle(DB);

    await db
      .insert(characterTable)
      .values({
        character_id: character.characterId,
        work_id: character.workId,
      })
      .onConflictDoUpdate({
        target: characterTable.character_id,
        set: {
          work_id: character.workId,
        },
      });

    return ok(undefined);
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
