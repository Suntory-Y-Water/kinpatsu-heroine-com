import { createRoute } from 'honox/factory';
import CharacterForm from './$character-form';

import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getWorkCharactersById } from '@/lib/api';
import { createAnnictId } from '@/utils/annict';
import { createRegistrationCharacter } from '@/lib/db';
import ImageUploader from '../$image-uploader';

const characterFormSchema = z.object({
  characterId: z.coerce
    .number()
    .min(1, { message: 'キャラクターIDは必須です' }),
  characterName: z.string().min(1, { message: 'キャラクター名は必須です' }),
  workId: z.coerce.number().min(1, { message: '作品IDは必須です' }),
  workName: z.string().min(1, { message: '作品名は必須です' }),
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
    const { characterId, characterName, workId, workName, imageUrl } =
      await c.req.valid('form');

    // リクエストボディの作成
    const requestBody = {
      workId,
      characterId,
      characterName,
      workName,
      imageUrl,
    };

    // キャラクター登録
    const result = await createRegistrationCharacter({
      DB: c.env.DB,
      character: requestBody,
    });

    if (result.isErr()) {
      throw new Error(result.error.message);
    }

    return c.redirect('/', 303);
  },
);

export default createRoute(async (c) => {
  const workId = c.req.query('workId');
  const workName = c.req.query('workName');

  const annictIdResult = createAnnictId(Number(workId));
  if (annictIdResult.isErr()) {
    throw new Error(annictIdResult.error.message);
  }

  const result = await getWorkCharactersById({
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
    <div className='max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg'>
      <h1 className='text-3xl font-bold text-center mb-8 text-white'>
        キャラクター登録
      </h1>
      <div className='mb-4 text-white'>
        <span className='font-medium'>作品名：</span>
        {workName}
      </div>
      <form method='post' action='/register/character'>
        {/*  API実行用の隠しフォーム */}
        <input type='hidden' name='workId' value={workId} />
        <input type='hidden' name='workName' value={workName} />
        <CharacterForm characters={characterData} />
        <ImageUploader />
        <button
          type='submit'
          className='w-full bg-yellow-300 text-gray-900 py-2 px-4 rounded font-medium hover:bg-yellow-500 transition-colors'
        >
          登録
        </button>
      </form>
    </div>,
  );
});
