import { updateUnregisterFlag } from '@/lib/db';
import { zValidator } from '@hono/zod-validator';
import { createRoute } from 'honox/factory';
import { z } from 'zod';

const formSchema = z.object({
  characterId: z.coerce
    .number()
    .min(1, { message: 'キャラクターIDは必須です' }),
  workId: z.coerce.number().min(1, { message: '作品IDは必須です' }),
});

/**
 * 登録済みキャラクターを非登録状態にするエンドポイント
 */
export const POST = createRoute(
  zValidator('form', formSchema, (result, c) => {
    if (!result.success) {
      const { logger } = c.var;
      logger.error({
        method: 'unregisterCharacter',
        message: 'キャラクターの非登録に失敗しました',
        error: result.error,
      });
      const message = encodeURIComponent('キャラクターの非登録に失敗しました。');
      return c.redirect(`/admin?status=error&message=${message}`);
    }
  }),
  async (c) => {
    const { characterId, workId } = await c.req.valid('form');

    const result = await updateUnregisterFlag({
      DB: c.env.DB,
      characterId,
      workId,
    });

    if (result.isErr()) {
      const message = encodeURIComponent('キャラクターの非登録に失敗しました。');
      return c.redirect(`/admin?status=error&message=${message}`);
    }

    const message = encodeURIComponent(
      'キャラクターを受付待ちリストに戻しました。',
    );
    return c.redirect(`/admin?status=success&message=${message}`);
  },
);