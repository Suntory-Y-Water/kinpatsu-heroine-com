import { inject, injectable } from 'inversify';
import type { D1Repository } from '../repositories/d1repository';
import type {
  CharacterInfo,
  CharacterList,
  WorkInfo,
  WorkStreamingSiteInfo,
} from '../types/character';
import { TYPES } from '../types/symbol-types';
import { Result } from 'neverthrow';
import { DatabaseError } from '../types/error';
import { StreamingSiteInfo } from '../types/annict';

@injectable()
export class D1usecase {
  constructor(@inject(TYPES.D1Repository) private D1Repository: D1Repository) {}

  async createRegistrationCharacter(p: {
    DB: D1Database;
    character: CharacterInfo;
  }): Promise<Result<void, DatabaseError>> {
    return await this.D1Repository.createRegistrationCharacter(p);
  }

  async getRegistrationQueueTable(DB: D1Database) {
    return await this.D1Repository.getRegistrationQueueTable(DB);
  }

  async updateDeleteFlag({
    DB,
    characterId,
    workId,
  }: {
    DB: D1Database;
    characterId: number;
    workId: number;
  }): Promise<Result<void, DatabaseError>> {
    return await this.D1Repository.updateDeleteFlag({
      DB,
      characterId,
      workId,
    });
  }

  async updateRegisterFlag({
    DB,
    characterId,
    workId,
  }: {
    DB: D1Database;
    characterId: number;
    workId: number;
  }): Promise<Result<void, DatabaseError>> {
    return await this.D1Repository.updateRegisterFlag({
      DB,
      characterId,
      workId,
    });
  }

  async createCharacter({
    DB,
    character,
  }: {
    DB: D1Database;
    character: CharacterInfo;
  }): Promise<Result<void, DatabaseError>> {
    return await this.D1Repository.createCharacter({
      DB,
      character,
    });
  }

  async createWork({
    DB,
    work,
  }: { DB: D1Database; work: WorkInfo }): Promise<Result<void, DatabaseError>> {
    return await this.D1Repository.createWork({ DB, work });
  }

  async createStreamingSite({
    DB,
    streamingSite,
  }: { DB: D1Database; streamingSite: StreamingSiteInfo[] }): Promise<
    Result<void, DatabaseError>
  > {
    return await this.D1Repository.createStreamingSite({ DB, streamingSite });
  }

  async createWorkStreamingSite({
    DB,
    workStreamingSite,
  }: { DB: D1Database; workStreamingSite: WorkStreamingSiteInfo[] }): Promise<
    Result<void, DatabaseError>
  > {
    return await this.D1Repository.createWorkStreamingSite({
      DB,
      workStreamingSite,
    });
  }

  async getAllCharacters({
    DB,
  }: {
    DB: D1Database;
  }): Promise<Result<CharacterList[], DatabaseError>> {
    return await this.D1Repository.getAllCharacters({ DB });
  }
}
