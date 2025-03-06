import type { Character } from '../types/character';

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
    // insert waiting_list_table
    const stmt = p.DB.prepare(`
      INSERT INTO waiting_list_table (
        character_id_annict,
        work_id_annict,
        character_image_url,
        registration_timestamp,
        registered_flag,
        deleted_flag
      ) VALUES (
        ?,
        ?,
        ?,
        CURRENT_TIMESTAMP,
        0,
        0
      )
    `);

    await stmt
      .bind(p.character.characterId, p.character.workId, p.character.imageUrl)
      .run();

    return p.character;
  }
}
