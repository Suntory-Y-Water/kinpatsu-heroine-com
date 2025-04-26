import { streamingSiteTable } from '@/config/drizzle/schema';
import { StreamingSiteInfo } from '@/types/annict';
import { DatabaseError } from '@/types/error';
import { drizzle } from 'drizzle-orm/d1';
import { err, ok, Result } from 'neverthrow';

export async function createStreamingSite({
  DB,
  streamingSite,
}: { DB: D1Database; streamingSite: StreamingSiteInfo[] }): Promise<
  Result<void, DatabaseError>
> {
  try {
    const db = drizzle(DB);

    for (const site of streamingSite) {
      await db
        .insert(streamingSiteTable)
        .values({
          streaming_site_id: site.streamingSiteId,
          streaming_site_name: site.streamingSiteName,
          streaming_site_url: site.streamingSiteUrl,
        })
        .onConflictDoNothing({
          target: streamingSiteTable.streaming_site_id,
        });
    }

    return ok(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
