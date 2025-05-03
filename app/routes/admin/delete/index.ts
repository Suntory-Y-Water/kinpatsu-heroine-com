import { updateDeleteFlag } from '@/lib/db';
import { zValidator } from '@hono/zod-validator';
import { createRoute } from 'honox/factory';

import { z } from 'zod';

const formSchema = z.object({
  characterId: z.coerce
    .number()
    .min(1, { message: 'キャラクターIDは必須です' }),
  workId: z.coerce.number().min(1, { message: '作品IDは必須です' }),
});

export const POST = createRoute(
  zValidator('form', formSchema, (result, c) => {
    if (!result.success) {
      const { logger } = c.var;
      logger.error({
        method: 'updateDeleteFlag',
        message: 'キャラクターの削除に失敗しました',
        error: result.error,
      });
      const message = encodeURIComponent('キャラクターの削除に失敗しました。');
      return c.redirect(`/admin?status=error&message=${message}`);
    }
  }),
  async (c) => {
    const { characterId, workId } = await c.req.valid('form');

    await updateDeleteFlag({
      DB: c.env.DB,
      characterId,
      workId,
    });

    const message = encodeURIComponent('キャラクターの削除に成功しました。');
    return c.redirect(`/admin?status=success&message=${message}`);
  },
);
