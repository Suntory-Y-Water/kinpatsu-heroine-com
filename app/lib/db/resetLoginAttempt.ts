import { drizzle } from 'drizzle-orm/d1';
import { loginAttemptsTable } from '@/config/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { ok, Result } from 'neverthrow';
import { DatabaseError, databaseErrorHandler } from '@/types/error';

export async function resetLoginAttempt({
  DB,
  ipAddress,
  username,
}: {
  DB: D1Database;
  ipAddress: string;
  username: string;
}): Promise<Result<void, DatabaseError>> {
  try {
    const db = drizzle(DB);

    await db
      .update(loginAttemptsTable)
      .set({
        failed_attempts: 0,
        last_failure_timestamp: new Date().toISOString(),
        lockout_until: null,
        updated_at: new Date().toISOString(),
      })
      .where(
        and(
          eq(loginAttemptsTable.ip_address, ipAddress),
          eq(loginAttemptsTable.username, username),
        ),
      );

    return ok(undefined);
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
