// 管理画面から登録待ち状態のキャラクターを削除する

import { zValidator } from '@hono/zod-validator';
import { createRoute } from 'honox/factory';

import { z } from 'zod';
import { container } from '../../../../src/container';
import { D1usecase } from '../../../../src/usecases/d1usecase';
import { TYPES } from '../../../../src/types/symbol-types';

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

    const d1usecase = container.get<D1usecase>(TYPES.D1Usecase);

    await d1usecase.updateDeleteFlag({
      DB: c.env.DB,
      characterId,
      workId,
    });

    return c.redirect('/admin');
  },
);
