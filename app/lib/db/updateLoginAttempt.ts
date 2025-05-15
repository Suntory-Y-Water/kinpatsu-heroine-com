import { drizzle } from 'drizzle-orm/d1';
import { loginAttemptsTable } from '@/config/drizzle/schema';
import { ok, Result } from 'neverthrow';
import { DatabaseError, databaseErrorHandler } from '@/types/error';

export async function updateLoginAttempt({
  DB,
  ipAddress,
  username,
  failedAttempts,
  lockoutUntil,
}: {
  DB: D1Database;
  ipAddress: string;
  username: string;
  failedAttempts: number;
  lockoutUntil: string | null;
}): Promise<Result<void, DatabaseError>> {
  try {
    const db = drizzle(DB);
    const now = new Date().toISOString();

    await db
      .insert(loginAttemptsTable)
      .values({
        ip_address: ipAddress,
        username: username,
        failed_attempts: failedAttempts,
        last_failure_timestamp: now,
        lockout_until: lockoutUntil,
        created_at: now,
        updated_at: now,
      })
      .onConflictDoUpdate({
        target: [loginAttemptsTable.ip_address, loginAttemptsTable.username],
        set: {
          failed_attempts: failedAttempts,
          last_failure_timestamp: now,
          lockout_until: lockoutUntil,
          updated_at: now,
        },
      });

    return ok(undefined);
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
