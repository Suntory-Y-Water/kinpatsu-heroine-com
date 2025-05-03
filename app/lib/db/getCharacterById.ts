import { drizzle } from 'drizzle-orm/d1';
import { registrationQueueTable, workTable } from '@/config/drizzle/schema';
import { err, ok } from 'neverthrow';
import { DatabaseError } from '@/types/error';
import { eq } from 'drizzle-orm';

export async function getCharacterById({
  DB,
  workId,
}: {
  DB: D1Database;
  workId: number;
}) {
  try {
    const db = drizzle(DB);

    const result = await db
      .select({
        characterId: registrationQueueTable.character_id,
      })
      .from(registrationQueueTable)
      .innerJoin(
        workTable,
        eq(registrationQueueTable.work_id, workTable.work_id),
      )
      .where(eq(registrationQueueTable.work_id, workId));

    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
