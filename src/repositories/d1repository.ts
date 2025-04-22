import type { Character, RegistrationCharacter } from '../types/character';
import { drizzle } from 'drizzle-orm/d1';
import { registrationQueueTable } from '../../drizzle/schema';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from '../types/error';

export interface D1Repository {
  createCharacter(p: {
    DB: D1Database;
    character: Character;
  }): Promise<Result<void, DatabaseError>>;

  /**
   *
   * @param {D1Database} DB
   */
  getRegistrationQueueTable(
    DB: D1Database,
  ): Promise<Result<RegistrationCharacter[], DatabaseError>>;
}

export class D1RepositoryImpl implements D1Repository {
  async createCharacter(p: {
    DB: D1Database;
    character: Character;
  }): Promise<Result<void, DatabaseError>> {
    try {
      const db = drizzle(p.DB);

      await db.insert(registrationQueueTable).values({
        character_id: p.character.characterId,
        work_id: p.character.workId,
        character_name: p.character.characterName,
        character_image_url: p.character.imageUrl,
        is_registered: false,
        is_deleted: false,
      });
      return ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }

  async getRegistrationQueueTable(DB: D1Database) {
    try {
      const db = drizzle(DB);

      const result = await db.select().from(registrationQueueTable);

      return ok(
        result.map((row) => ({
          characterId: row.character_id,
          workId: row.work_id,
          characterName: row.character_name,
          imageUrl: row.character_image_url,
          registrationDate: row.registration_date,
          isRegistered: row.is_registered,
          isDeleted: row.is_deleted,
        })),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }
}
