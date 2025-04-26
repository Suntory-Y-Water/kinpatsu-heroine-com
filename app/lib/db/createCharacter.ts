import { characterTable } from '@/config/drizzle/schema';
import { CharacterInfo } from '@/types/character';
import { DatabaseError } from '@/types/error';
import { drizzle } from 'drizzle-orm/d1';
import { err, ok, Result } from 'neverthrow';

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
        character_name: character.characterName,
        character_image_url: character.imageUrl,
        work_id: character.workId,
      })
      .onConflictDoUpdate({
        target: characterTable.character_id,
        set: {
          character_name: character.characterName,
          character_image_url: character.imageUrl,
          work_id: character.workId,
        },
      });

    return ok(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
