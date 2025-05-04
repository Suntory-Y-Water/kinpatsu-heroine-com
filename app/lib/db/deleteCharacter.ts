import { drizzle } from 'drizzle-orm/d1';
import { registrationQueueTable } from '@/config/drizzle/schema';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from '@/types/error';
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
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
