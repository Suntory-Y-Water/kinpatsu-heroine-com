import { drizzle } from 'drizzle-orm/d1';
import {
  characterTable,
  workTable,
  streamingSiteTable,
  workStreamingSiteTable,
  likeHistoryTable,
} from '@/config/drizzle/schema';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from '@/types/error';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { CharacterDetail } from '@/types/character';

export async function getCharacterById({
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
        streamingSiteUrl: streamingSiteTable.streaming_site_url,
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
      streamingSiteId: site.streamingSiteId || '',
      streamingSiteName: site.streamingSiteName || '',
      streamingSiteUrl: site.streamingSiteUrl || '',
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
