import { drizzle } from 'drizzle-orm/d1';
import { registrationQueueTable } from '@/config/drizzle/schema';
import { ok, Result } from 'neverthrow';
import { DatabaseError, databaseErrorHandler } from '@/types/error';
import { eq, and } from 'drizzle-orm';

export async function deleteCharacter({
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
      .delete(registrationQueueTable)
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
