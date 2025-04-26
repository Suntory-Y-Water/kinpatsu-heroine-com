// 管理画面から受付待ちリストを登録状態にする

import { zValidator } from '@hono/zod-validator';
import { createRoute } from 'honox/factory';

import { z } from 'zod';
import { container } from '../../../../src/container';
import { D1usecase } from '../../../../src/usecases/d1usecase';
import { TYPES } from '../../../../src/types/symbol-types';
import { AnnictUsecase } from '../../../../src/usecases/annict-usecase';
import { ParseUsecase } from '../../../../src/usecases/parse-usecase';

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
      console.error(result.error);
      return c.redirect('/admin');
    }
  }),
  async (c) => {
    const { characterId, workId, characterName, workName, imageUrl } =
      await c.req.valid('form');

    const annictUsecase = container.get<AnnictUsecase>(TYPES.AnnictUsecase);

    // 配信サイト情報、wikipedia、公式サイト情報取得のためのhtmlを取得
    const response = await annictUsecase.fetchAnnictPage(
      `https://annict.com/works/${workId}`,
    );

    if (response.isErr()) {
      throw new Error(response.error.message);
    }

    // ドメイン層から処理実装
    // htmlから配信サイト情報、wikipedia、公式サイト情報を取得
    const parseUsecase = container.get<ParseUsecase>(TYPES.ParseUsecase);
    const annictPageInfo = await parseUsecase.parseAnnictPage(response.value);

    const d1usecase = container.get<D1usecase>(TYPES.D1Usecase);

    // 作品情報の登録 - 先に実行してworkの外部キー参照を確保
    const createWorkResult = await d1usecase.createWork({
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
      throw new Error(createWorkResult.error.message);
    }

    // キャラクター情報の登録 - 作品登録後に実行
    const createCharacterResult = await d1usecase.createCharacter({
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
      throw new Error(createCharacterResult.error.message);
    }

    // TODO: 配信サイトテーブルの登録
    const createStreamingSiteResult = await d1usecase.createStreamingSite({
      DB: c.env.DB,
      streamingSite: annictPageInfo.streamingServices.map((service) => ({
        streamingSiteId: new URL(service.url).hostname,
        streamingSiteName: service.name,
        streamingSiteUrl: service.url,
      })),
    });

    if (createStreamingSiteResult.isErr()) {
      throw new Error(createStreamingSiteResult.error.message);
    }

    // 作品_配信サイト紐付けテーブルの登録
    const createWorkStreamingSiteResult =
      await d1usecase.createWorkStreamingSite({
        DB: c.env.DB,
        workStreamingSite: annictPageInfo.streamingServices.map((service) => ({
          workId,
          streamingSiteId: new URL(service.url).hostname,
          streamingSiteUrl: service.url,
        })),
      });

    if (createWorkStreamingSiteResult.isErr()) {
      throw new Error(createWorkStreamingSiteResult.error.message);
    }

    // 登録済みリストへ更新
    const updateResult = await d1usecase.updateRegisterFlag({
      DB: c.env.DB,
      characterId,
      workId,
    });

    if (updateResult.isErr()) {
      throw new Error(updateResult.error.message);
    }

    return c.redirect('/admin');
  },
);
