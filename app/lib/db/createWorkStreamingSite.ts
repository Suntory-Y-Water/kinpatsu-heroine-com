import { drizzle } from 'drizzle-orm/d1';
import { workStreamingSiteTable } from '../../config/drizzle/schema';
import { ok, Result } from 'neverthrow';
import { DatabaseError, databaseErrorHandler } from '../../types/error';
import type { WorkStreamingSiteInfo } from '../../types/character';

/**
 * 作品_配信サイト紐付けテーブルの作成
 * @param {D1Database} DB D1Database
 * @param {WorkStreamingSiteInfo[]} workStreamingSite 作品_配信サイト紐付けテーブルの構造体
 */
export async function createWorkStreamingSite({
  DB,
  workStreamingSite,
}: { DB: D1Database; workStreamingSite: WorkStreamingSiteInfo[] }): Promise<
  Result<void, DatabaseError>
> {
  try {
    const db = drizzle(DB);

    for (const site of workStreamingSite) {
      await db
        .insert(workStreamingSiteTable)
        .values({
          work_id: site.workId,
          streaming_site_id: site.streamingSiteId,
          streaming_site_url: site.streamingSiteUrl,
        })
        .onConflictDoNothing({
          target: [
            workStreamingSiteTable.work_id,
            workStreamingSiteTable.streaming_site_id,
          ],
        });
    }

    return ok(undefined);
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
