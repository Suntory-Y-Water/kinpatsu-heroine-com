import { drizzle } from 'drizzle-orm/d1';
import {
  registrationQueueTable,
  workTable,
  streamingSiteTable,
  workStreamingSiteTable,
  likeHistoryTable,
} from '@/config/drizzle/schema';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from '@/types/error';
import { eq, count, and } from 'drizzle-orm';
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

    const characterResult = await db
      .select({
        characterId: registrationQueueTable.character_id,
        characterName: registrationQueueTable.character_name,
        imageUrl: registrationQueueTable.character_image_url,
        workId: registrationQueueTable.work_id,
        workName: registrationQueueTable.work_name,
        officialSiteUrl: workTable.official_site_url,
        wikipediaUrl: workTable.wikipedia_url,
        likes: count(likeHistoryTable.character_id).as('likes'),
      })
      .from(registrationQueueTable)
      .leftJoin(
        workTable,
        eq(registrationQueueTable.work_id, workTable.work_id),
      )
      .leftJoin(
        likeHistoryTable,
        eq(registrationQueueTable.character_id, likeHistoryTable.character_id),
      )
      .where(
        and(
          eq(registrationQueueTable.character_id, characterId),
          eq(registrationQueueTable.is_deleted, false),
        ),
      )
      .groupBy(
        registrationQueueTable.character_id,
        registrationQueueTable.character_name,
        registrationQueueTable.character_image_url,
        registrationQueueTable.work_id,
        registrationQueueTable.work_name,
        workTable.official_site_url,
        workTable.wikipedia_url,
      );

    if (characterResult.length === 0) {
      return err(new DatabaseError('Character not found or deleted'));
    }

    const characterData = characterResult[0];

    const streamingSiteResult = await db
      .select({
        streamingSiteId: streamingSiteTable.streaming_site_id,
        streamingSiteName: streamingSiteTable.streaming_site_name,
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
      .where(eq(workStreamingSiteTable.work_id, characterData.workId));

    const streamingSiteInfo = streamingSiteResult.map((site) => ({
      streamingSiteId: site.streamingSiteId || '',
      streamingSiteName: site.streamingSiteName || '',
      streamingSiteUrl: site.streamingSiteUrl || '',
    }));

    const result: CharacterDetail = {
      characterId: characterData.characterId,
      characterName: characterData.characterName,
      imageUrl: characterData.imageUrl,
      workId: characterData.workId,
      workName: characterData.workName || '',
      likes: characterData.likes || 0,
      infoUrl: {
        officialSiteUrl: characterData.officialSiteUrl || '',
        wikipediaUrl: characterData.wikipediaUrl || '',
      },
      streamingSiteInfo,
    };

    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
