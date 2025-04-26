import type {
  CharacterDetail,
  CharacterInfo,
  CharacterList,
  RegistrationCharacter,
  WorkInfo,
  WorkStreamingSiteInfo,
} from '../types/character';
import { drizzle } from 'drizzle-orm/d1';
import {
  characterTable,
  registrationQueueTable,
  streamingSiteTable,
  workStreamingSiteTable,
  workTable,
  likeHistoryTable,
} from '../../drizzle/schema';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from '../types/error';
import { and, eq } from 'drizzle-orm';
import { customLogger } from '../../app/routes/_middleware';
import { StreamingSiteInfo } from '../types/annict';
import { sql } from 'drizzle-orm';

export interface D1Repository {
  createRegistrationCharacter(p: {
    DB: D1Database;
    character: CharacterInfo;
  }): Promise<Result<void, DatabaseError>>;

  /**
   *
   * @param {D1Database} DB
   */
  getRegistrationQueueTable(
    DB: D1Database,
  ): Promise<Result<RegistrationCharacter[], DatabaseError>>;

  updateDeleteFlag({
    DB,
    characterId,
    workId,
  }: {
    DB: D1Database;
    characterId: number;
    workId: number;
  }): Promise<Result<void, DatabaseError>>;

  updateRegisterFlag({
    DB,
    characterId,
    workId,
  }: {
    DB: D1Database;
    characterId: number;
    workId: number;
  }): Promise<Result<void, DatabaseError>>;

  createCharacter({
    DB,
    character,
  }: {
    DB: D1Database;
    character: CharacterInfo;
  }): Promise<Result<void, DatabaseError>>;

  createWork({
    DB,
    work,
  }: {
    DB: D1Database;
    work: WorkInfo;
  }): Promise<Result<void, DatabaseError>>;

  createStreamingSite({
    DB,
    streamingSite,
  }: {
    DB: D1Database;
    streamingSite: StreamingSiteInfo[];
  }): Promise<Result<void, DatabaseError>>;

  /**
   * 作品_配信サイト紐付けテーブルの作成
   * @param {D1Database} DB D1Database
   * @param {WorkStreamingSiteInfo[]} workStreamingSite 作品_配信サイト紐付けテーブルの構造体
   */
  createWorkStreamingSite({
    DB,
    workStreamingSite,
  }: {
    DB: D1Database;
    workStreamingSite: WorkStreamingSiteInfo[];
  }): Promise<Result<void, DatabaseError>>;

  getAllCharacters({
    DB,
  }: {
    DB: D1Database;
  }): Promise<Result<CharacterList[], DatabaseError>>;

  getCharacterById({
    DB,
    characterId,
  }: {
    DB: D1Database;
    characterId: number;
  }): Promise<Result<CharacterDetail, DatabaseError>>;
}

export class D1RepositoryImpl implements D1Repository {
  async createRegistrationCharacter(p: {
    DB: D1Database;
    character: CharacterInfo;
  }): Promise<Result<void, DatabaseError>> {
    try {
      const db = drizzle(p.DB);

      await db.insert(registrationQueueTable).values({
        character_id: p.character.characterId,
        work_id: p.character.workId,
        character_name: p.character.characterName,
        work_name: p.character.workName,
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
          workName: row.work_name,
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

  async updateDeleteFlag({
    DB,
    characterId,
    workId,
  }: {
    DB: D1Database;
    characterId: number;
    workId: number;
  }): Promise<Result<void, DatabaseError>> {
    try {
      const db = drizzle(DB);

      await db
        .update(registrationQueueTable)
        .set({
          is_deleted: true,
        })
        .where(
          and(
            eq(registrationQueueTable.character_id, characterId),
            eq(registrationQueueTable.work_id, workId),
          ),
        );

      return ok(undefined);
    } catch (error) {
      customLogger(error as string);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
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
    try {
      const db = drizzle(DB);

      await db
        .update(registrationQueueTable)
        .set({
          is_registered: true,
        })
        .where(
          and(
            eq(registrationQueueTable.character_id, characterId),
            eq(registrationQueueTable.work_id, workId),
          ),
        );

      return ok(undefined);
    } catch (error) {
      customLogger(error as string);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }

  async createCharacter({
    DB,
    character,
  }: {
    DB: D1Database;
    character: CharacterInfo;
  }): Promise<Result<void, DatabaseError>> {
    try {
      const db = drizzle(DB);

      await db
        .insert(characterTable)
        .values({
          character_id: character.characterId,
          character_name: character.characterName,
          character_image_url: character.imageUrl,
          work_id: character.workId,
        })
        .onConflictDoUpdate({
          target: characterTable.character_id,
          set: {
            character_name: character.characterName,
            character_image_url: character.imageUrl,
            work_id: character.workId,
          },
        });

      return ok(undefined);
    } catch (error) {
      customLogger(error as string);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }

  async createWork({
    DB,
    work,
  }: { DB: D1Database; work: WorkInfo }): Promise<Result<void, DatabaseError>> {
    try {
      const db = drizzle(DB);

      await db
        .insert(workTable)
        .values({
          work_id: work.workId,
          work_name: work.workName,
          official_site_url: work.officialSiteUrl,
          wikipedia_url: work.wikipediaUrl,
        })
        .onConflictDoUpdate({
          target: workTable.work_id,
          set: {
            work_name: work.workName,
            official_site_url: work.officialSiteUrl,
            wikipedia_url: work.wikipediaUrl,
          },
        });

      return ok(undefined);
    } catch (error) {
      customLogger(error as string);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }

  async createStreamingSite({
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
            streaming_site_id: site.streamingSiteId.hostname,
            streaming_site_name: site.streamingSiteName,
            icon_url: site.iconUrl || '',
          })
          .onConflictDoNothing({
            target: streamingSiteTable.streaming_site_id,
          });
      }

      return ok(undefined);
    } catch (error) {
      customLogger(error as string);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }

  async createWorkStreamingSite({
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
      customLogger(error as string);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }

  async getAllCharacters({
    DB,
  }: {
    DB: D1Database;
  }): Promise<Result<CharacterList[], DatabaseError>> {
    try {
      const db = drizzle(DB);

      const rawResult = await db
        .select({
          characterId: characterTable.character_id,
          characterName: characterTable.character_name,
          imageUrl: characterTable.character_image_url,
          workName: workTable.work_name,
          likes: sql`COUNT(${likeHistoryTable.character_id})`.as('likes'),
        })
        .from(characterTable)
        .leftJoin(workTable, eq(characterTable.work_id, workTable.work_id))
        .leftJoin(
          likeHistoryTable,
          eq(characterTable.character_id, likeHistoryTable.character_id),
        )
        .groupBy(characterTable.character_id);

      const result: CharacterList[] = rawResult.map((row) => ({
        characterId: row.characterId,
        characterName: row.characterName,
        imageUrl: row.imageUrl,
        workName: row.workName || '',
        likes: Number(row.likes) || 0,
      }));

      return ok(result);
    } catch (error) {
      customLogger(error as string);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }

  async getCharacterById({
    DB,
    characterId,
  }: {
    DB: D1Database;
    characterId: number;
  }): Promise<Result<CharacterDetail, DatabaseError>> {
    try {
      const db = drizzle(DB);

      // キャラクター基本情報と作品情報を取得
      const characterResult = await db
        .select({
          characterId: characterTable.character_id,
          characterName: characterTable.character_name,
          imageUrl: characterTable.character_image_url,
          workId: characterTable.work_id,
          workName: workTable.work_name,
          officialSiteUrl: workTable.official_site_url,
          wikipediaUrl: workTable.wikipedia_url,
          likes: sql`COUNT(${likeHistoryTable.character_id})`.as('likes'),
        })
        .from(characterTable)
        .leftJoin(workTable, eq(characterTable.work_id, workTable.work_id))
        .leftJoin(
          likeHistoryTable,
          eq(characterTable.character_id, likeHistoryTable.character_id),
        )
        .where(eq(characterTable.character_id, characterId))
        .groupBy(characterTable.character_id);

      if (characterResult.length === 0) {
        return err(new DatabaseError('Character not found'));
      }

      // 配信サイト情報を取得
      const streamingSiteResult = await db
        .select({
          streamingSiteId: streamingSiteTable.streaming_site_id,
          streamingSiteName: streamingSiteTable.streaming_site_name,
          iconUrl: streamingSiteTable.icon_url,
          streamingSiteUrl: workStreamingSiteTable.streaming_site_url,
        })
        .from(workStreamingSiteTable)
        .leftJoin(
          streamingSiteTable,
          eq(
            workStreamingSiteTable.streaming_site_id,
            streamingSiteTable.streaming_site_id,
          ),
        )
        .where(eq(workStreamingSiteTable.work_id, characterResult[0].workId));

      // 配信サイト情報をStreamingSiteInfo型に整形
      const streamingSiteInfo = streamingSiteResult.map((site) => ({
        streamingSiteId: new URL(`https://${site.streamingSiteId}`), // ドメイン名からURLを作成
        streamingSiteName: site.streamingSiteName || '',
        iconUrl: site.iconUrl || '',
        url: site.streamingSiteUrl || '',
      }));

      // CharacterDetail型に整形
      const result: CharacterDetail = {
        characterId: characterResult[0].characterId,
        characterName: characterResult[0].characterName,
        imageUrl: characterResult[0].imageUrl,
        workId: characterResult[0].workId,
        workName: characterResult[0].workName || '',
        likes: Number(characterResult[0].likes) || 0,
        infoUrl: {
          officialSiteUrl: characterResult[0].officialSiteUrl || '',
          wikipediaUrl: characterResult[0].wikipediaUrl || '',
        },
        streamingSiteInfo,
      };

      return ok(result);
    } catch (error) {
      customLogger(error as string);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(new DatabaseError(message, error));
    }
  }
}
