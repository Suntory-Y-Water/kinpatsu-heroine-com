import { deleteCharacter } from '@/lib/db/deleteCharacter';
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
        method: 'deleteCharacter',
        message: 'キャラクターの完全削除に失敗しました',
        error: result.error,
      });
      const message = encodeURIComponent(
        'キャラクターの完全削除に失敗しました。',
      );
      return c.redirect(`/admin?status=error&message=${message}`);
    }
  }),
  async (c) => {
    const { characterId, workId } = await c.req.valid('form');

    const result = await deleteCharacter({
      DB: c.env.DB,
      characterId,
      workId,
    });

    if (result.isErr()) {
      const message = encodeURIComponent(
        'キャラクターの完全削除に失敗しました。',
      );
      return c.redirect(`/admin?status=error&message=${message}`);
    }

    const message = encodeURIComponent('キャラクターを完全に削除しました。');
    return c.redirect(`/admin?status=success&message=${message}`);
  },
);
