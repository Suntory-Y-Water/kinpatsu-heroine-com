// 管理画面から受付待ちリストを登録状態にする

import { zValidator } from '@hono/zod-validator';
import { createRoute } from 'honox/factory';

import { z } from 'zod';
import { fetchRequest } from '@/lib/client';
import {
  createCharacter,
  createStreamingSite,
  createWork,
  createWorkStreamingSite,
  updateRegisterFlag,
} from '@/lib/db';
import { parseAnnictPage } from '@/lib/parseAnnictPage';

const formSchema = z.object({
  characterId: z.coerce
    .number()
    .min(1, { message: 'キャラクターIDは必須です' }),
  workId: z.coerce.number().min(1, { message: '作品IDは必須です' }),
  characterName: z.string().min(1, { message: 'キャラクター名は必須です' }),
  workName: z.string().min(1, { message: '作品名は必須です' }),
  imageUrl: z.string().min(1, { message: '画像URLは必須です' }),
});

export const POST = createRoute(
  zValidator('form', formSchema, (result, c) => {
    if (!result.success) {
      const { logger } = c.var;
      logger.error({
        method: 'registerCharacter',
        message: 'キャラクターの登録に失敗しました',
        error: result.error,
      });
      const message = encodeURIComponent('キャラクターの登録に失敗しました。');
      return c.redirect(`/admin?status=error&message=${message}`);
    }
  }),
  async (c) => {
    const { logger } = c.var;
    const { characterId, workId, characterName, workName, imageUrl } =
      await c.req.valid('form');

    // 配信サイト情報、wikipedia、公式サイト情報取得のためのhtmlを取得
    const response = await fetchRequest(`https://annict.com/works/${workId}`);

    const message = encodeURIComponent('キャラクターの登録に失敗しました。');

    if (response.isErr()) {
      logger.error({
        method: 'fetchRequest',
        message: '配信サイト情報、wikipedia、公式サイト情報取得に失敗しました',
        error: response.error,
      });
      return c.redirect(`/admin?status=error&message=${message}`);
    }

    // ドメイン層から処理実装
    // htmlから配信サイト情報、wikipedia、公式サイト情報を取得
    const annictPageInfo = await parseAnnictPage(response.value);

    // 作品情報の登録 - 先に実行してworkの外部キー参照を確保
    const createWorkResult = await createWork({
      DB: c.env.DB,
      work: {
        workId,
        workName,
        // TODO: nullをテーブルに入れるな
        officialSiteUrl: annictPageInfo.officialSiteUrl || '',
        wikipediaUrl: annictPageInfo.wikipediaUrl || '',
      },
    });

    if (createWorkResult.isErr()) {
      logger.error({
        method: 'createWork',
        message: '作品情報の登録に失敗しました',
        error: createWorkResult.error,
      });
      return c.redirect(`/admin?status=error&message=${message}`);
    }

    // キャラクター情報の登録 - 作品登録後に実行
    const createCharacterResult = await createCharacter({
      DB: c.env.DB,
      character: {
        characterId,
        characterName,
        workId,
        workName,
        imageUrl,
      },
    });

    if (createCharacterResult.isErr()) {
      logger.error({
        method: 'createCharacter',
        message: 'キャラクター情報の登録に失敗しました',
        error: createCharacterResult.error,
      });
      return c.redirect(`/admin?status=error&message=${message}`);
    }

    const createStreamingSiteResult = await createStreamingSite({
      DB: c.env.DB,
      streamingSite: annictPageInfo.streamingServices.map((service) => ({
        streamingSiteId: new URL(service.url).hostname,
        streamingSiteName: service.name,
        streamingSiteUrl: service.url,
      })),
    });

    if (createStreamingSiteResult.isErr()) {
      logger.error({
        method: 'createStreamingSite',
        message: '配信サイト情報の登録に失敗しました',
        error: createStreamingSiteResult.error,
      });
      return c.redirect(`/admin?status=error&message=${message}`);
    }

    // 作品_配信サイト紐付けテーブルの登録
    const createWorkStreamingSiteResult = await createWorkStreamingSite({
      DB: c.env.DB,
      workStreamingSite: annictPageInfo.streamingServices.map((service) => ({
        workId,
        streamingSiteId: new URL(service.url).hostname,
        streamingSiteUrl: service.url,
      })),
    });

    if (createWorkStreamingSiteResult.isErr()) {
      logger.error({
        method: 'createWorkStreamingSite',
        message: '作品_配信サイト紐付けテーブルの登録に失敗しました',
        error: createWorkStreamingSiteResult.error,
      });
      return c.redirect(`/admin?status=error&message=${message}`);
    }

    // 登録済みリストへ更新
    const updateResult = await updateRegisterFlag({
      DB: c.env.DB,
      characterId,
      workId,
    });

    if (updateResult.isErr()) {
      logger.error({
        method: 'updateRegisterFlag',
        message: '登録済みリストへ更新に失敗しました',
        error: updateResult.error,
      });
      return c.redirect(`/admin?status=error&message=${message}`);
    }

    const successMessage = encodeURIComponent(
      'キャラクターの登録に成功しました。',
    );
    return c.redirect(`/admin?status=success&message=${successMessage}`);
  },
);
