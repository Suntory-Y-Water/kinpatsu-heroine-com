import { workTable } from '@/config/drizzle/schema';
import { WorkInfo } from '@/types/character';
import { DatabaseError } from '@/types/error';
import { drizzle } from 'drizzle-orm/d1';
import { err, ok, Result } from 'neverthrow';

export async function createWork({
  DB,
  work,
}: { DB: D1Database; work: WorkInfo }): Promise<Result<void, DatabaseError>> {
  try {
    const db = drizzle(DB);

    await db
      .insert(workTable)
      .values({
        work_id: work.workId,
        official_site_url: work.officialSiteUrl,
        wikipedia_url: work.wikipediaUrl,
      })
      .onConflictDoUpdate({
        target: workTable.work_id,
        set: {
          official_site_url: work.officialSiteUrl,
          wikipedia_url: work.wikipediaUrl,
        },
      });

    return ok(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
