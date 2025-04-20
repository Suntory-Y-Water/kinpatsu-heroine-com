import type { Character } from '../types/character';
import { drizzle } from 'drizzle-orm/d1';
import { registrationQueueTable } from '../../drizzle/schema';

export interface D1Repository {
  createCharacter(p: {
    DB: D1Database;
    character: Character;
  }): Promise<Character>;
}

export class D1RepositoryImpl implements D1Repository {
  async createCharacter(p: {
    DB: D1Database;
    character: Character;
  }): Promise<Character> {
    const db = drizzle(p.DB);

    await db.insert(registrationQueueTable).values({
      character_id: p.character.characterId,
      work_id: p.character.workId,
      character_name: p.character.characterName,
      character_image_url: p.character.imageUrl,
      is_registered: false,
      is_deleted: false,
    });

    return p.character;
  }
}
