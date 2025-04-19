import { createRoute } from 'honox/factory';
import { createAnnictId } from '../../../../src/domain/value_object/annict';
import { container } from '../../../../src/container';
import type { AnnictUsecase } from '../../../../src/usecases/annict-usecase';
import { TYPES } from '../../../../src/types/symbol-types';
import CharacterForm from './$character-form';

import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import ImageUploader from '../$image-uploader';
import type { D1usecase } from '../../../../src/usecases/d1usecase';

const characterFormSchema = z.object({
  characterId: z.coerce
    .number()
    .min(1, { message: 'キャラクターIDは必須です' }),
  workId: z.coerce.number().min(1, { message: '作品IDは必須です' }),
  imageUrl: z.string().min(1, { message: '画像URLは必須です' }),
});

export const POST = createRoute(
  zValidator('form', characterFormSchema, (result, c) => {
    if (!result.success) {
      console.error(result.error);
      return c.redirect('/register/work');
    }
  }),
  async (c) => {
    const { characterId, workId, imageUrl } = await c.req.valid('form');

    // リクエストボディの作成
    const requestBody = {
      workId,
      characterId,
      imageUrl,
    };

    // キャラクター登録
    const d1usecase = container.get<D1usecase>(TYPES.D1Usecase);

    await d1usecase.createCharacter({
      DB: c.env.DB,
      character: requestBody,
    });
    return c.redirect('/register', 303);
  },
);

export default createRoute(async (c) => {
  const workId = c.req.query('workId');
  const workName = c.req.query('workName');

  const annictIdResult = createAnnictId(Number(workId));
  if (annictIdResult.isErr()) {
    throw new Error(annictIdResult.error.message);
  }

  const annictUsecase = container.get<AnnictUsecase>(TYPES.AnnictUsecase);
  const result = await annictUsecase.getWorkCharactersById({
    clientId: c.env.ANNICT_CLIENT_ID,
    id: annictIdResult.value,
  });

  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  const characterEdges =
    result.value.data.searchWorks.edges[0]?.node.casts.edges || [];
  const characterData = characterEdges.map((edge) => ({
    annictId: edge.node.character.annictId,
    name: edge.node.character.name,
  }));

  return c.render(
    <div className='max-w-md mx-auto bg-[#232836] p-6 rounded-lg shadow-lg border border-yellow-900/30'>
      <h1 className='text-2xl font-bold text-[#F3DB5F] mb-6'>
        キャラクター登録
      </h1>
      <div className='mb-4 text-[#FFFDE7]'>
        <span className='font-medium'>作品名：</span>
        {workName}
      </div>
      <form method='post' action='/register/character'>
        {/*  API実行用の隠しフォーム */}
        <input type='hidden' name='workId' value={workId} />
        <CharacterForm characters={characterData} />
        <ImageUploader />
        <button
          type='submit'
          className='w-full bg-[#F3DB5F] text-[#1A1F2C] py-2 px-4 rounded font-medium hover:bg-[#E5CD50] transition-colors'
        >
          登録
        </button>
      </form>
    </div>,
  );
});
