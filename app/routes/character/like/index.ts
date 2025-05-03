import { drizzle } from 'drizzle-orm/d1';
import { likeHistoryTable } from '@/config/drizzle/schema';
import { createRoute } from 'honox/factory';
import { getCookie, setCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { Context } from 'hono';

// リクエストボディのバリデーションスキーマ
const likeSchema = z.object({
  characterId: z.coerce.number().int().positive(),
});

// Cookie IDの取得または生成
function getCookieId(c: Context) {
  const COOKIE_NAME = 'visitor_id';
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1年

  let visitorId = getCookie(c, COOKIE_NAME);

  // Cookie IDがない場合は新規生成
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    setCookie(c, COOKIE_NAME, visitorId, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'Lax',
    });
  }

  return visitorId;
}

export const POST = createRoute(zValidator('json', likeSchema), async (c) => {
  const { logger } = c.var;
  try {
    const { characterId } = await c.req.valid('json');
    const cookieId = getCookieId(c);
    const db = drizzle(c.env.DB);

    // すでにいいねがあるか確認
    const existingLike = await db
      .select()
      .from(likeHistoryTable)
      .where(
        and(
          eq(likeHistoryTable.character_id, characterId),
          eq(likeHistoryTable.cookie_id, cookieId),
        ),
      )
      .limit(1);

    // いいねがすでに存在する場合は409を返す
    if (existingLike.length > 0) {
      logger.info({
        message: '既にいいね済みです',
        characterId,
      });
      return c.json({ success: false, message: '既にいいね済みです' }, 409);
    }

    // いいねを登録
    await db.insert(likeHistoryTable).values({
      character_id: characterId,
      cookie_id: cookieId,
    });

    // 登録後の総いいね数を取得
    const result = await db
      .select({
        total: sql`COUNT(*)`,
      })
      .from(likeHistoryTable)
      .where(eq(likeHistoryTable.character_id, characterId));

    const total = result[0] ? Number(result[0].total) : 0;

    return c.json({
      success: true,
      likes: total,
      message: 'いいねを登録しました',
    });
  } catch (error) {
    logger.error({
      message: 'いいねの処理中にエラーが発生しました',
      error: error,
    });
    return c.json(
      {
        success: false,
        message: 'いいねの処理中にエラーが発生しました',
      },
      500,
    );
  }
});
