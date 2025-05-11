import { registrationQueueTable } from '@/config/drizzle/schema';
import { CharacterInfo } from '@/types/character';
import { DatabaseError, databaseErrorHandler } from '@/types/error';
import { drizzle } from 'drizzle-orm/d1';
import { ok, Result } from 'neverthrow';

export async function createRegistrationCharacter(p: {
  DB: D1Database;
  character: CharacterInfo;
}): Promise<Result<void, DatabaseError>> {
  try {
    const db = drizzle(p.DB);

    await db.insert(registrationQueueTable).values({
      character_id: p.character.characterId,
      work_id: p.character.workId,
      character_name: p.character.characterName,
      work_name: p.character.workName,
      character_image_url: p.character.imageUrl,
      is_registered: false,
      is_deleted: false,
    });
    return ok(undefined);
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
