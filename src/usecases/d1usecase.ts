import { inject, injectable } from 'inversify';
import type { D1Repository } from '../repositories/d1repository';
import type { Character } from '../types/character';
import { TYPES } from '../types/symbol-types';

@injectable()
export class D1usecase {
  constructor(@inject(TYPES.D1Repository) private D1Repository: D1Repository) {}

  async createCharacter(p: {
    DB: D1Database;
    character: Character;
  }): Promise<Character> {
    return await this.D1Repository.createCharacter(p);
  }

  async getRegistrationQueueTable(DB: D1Database) {
    return await this.D1Repository.getRegistrationQueueTable(DB);
  }
}
