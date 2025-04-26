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
      console.error(result.error);
      return c.redirect('/admin');
    }
  }),
  async (c) => {
    const { characterId, workId } = await c.req.valid('form');

    await updateDeleteFlag({
      DB: c.env.DB,
      characterId,
      workId,
    });

    return c.redirect('/admin');
  },
);
