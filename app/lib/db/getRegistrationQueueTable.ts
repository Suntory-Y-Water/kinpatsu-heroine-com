import { drizzle } from 'drizzle-orm/d1';
import { registrationQueueTable } from '@/config/drizzle/schema';
import { ok, Result } from 'neverthrow';
import { DatabaseError, databaseErrorHandler } from '@/types/error';
import type { RegistrationCharacter } from '@/types/character';

export async function getRegistrationQueueTable(
  DB: D1Database,
): Promise<Result<RegistrationCharacter[], DatabaseError>> {
  try {
    const db = drizzle(DB);

    const result = await db.select().from(registrationQueueTable);

    return ok(
      result.map((row) => ({
        characterId: row.character_id,
        workId: row.work_id,
        characterName: row.character_name,
        imageUrl: row.character_image_url,
        workName: row.work_name,
        registrationDate: row.registration_date,
        isRegistered: row.is_registered,
        isDeleted: row.is_deleted,
      })),
    );
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
