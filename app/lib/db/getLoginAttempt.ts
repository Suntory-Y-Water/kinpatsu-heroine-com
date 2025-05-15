import { drizzle } from 'drizzle-orm/d1';
import { loginAttemptsTable } from '@/config/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { ok, Result } from 'neverthrow';
import { DatabaseError, databaseErrorHandler } from '@/types/error';

export async function getLoginAttempt({
  DB,
  ipAddress,
  username,
}: {
  DB: D1Database;
  ipAddress: string;
  username: string;
}): Promise<
  Result<typeof loginAttemptsTable.$inferSelect | null, DatabaseError>
> {
  try {
    const db = drizzle(DB);

    const result = await db
      .select()
      .from(loginAttemptsTable)
      .where(
        and(
          eq(loginAttemptsTable.ip_address, ipAddress),
          eq(loginAttemptsTable.username, username),
        ),
      )
      .limit(1);

    return ok(result[0] || null);
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
