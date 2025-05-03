import { createRoute } from 'honox/factory';
import WorkForm from './$work-form';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getWorkCharactersById, getWorks } from '@/lib/api';
import { getCharacterById } from '@/lib/db/getCharacterById';

const workFormSchema = z.object({
  workId: z.coerce.number().min(1, { message: '作品IDは必須です' }),
  workName: z.string().min(1, { message: '作品名は必須です' }),
});

export const POST = createRoute(
  zValidator('form', workFormSchema, (result, c) => {
    if (!result.success) {
      console.error(result.error);
      return c.redirect('/register/work');
    }
  }),
  async (c) => {
    const { workId, workName } = await c.req.valid('form');
    const { logger } = c.var;
    const DB = c.env.DB;

    const result = await getWorkCharactersById({
      clientId: c.env.ANNICT_CLIENT_ID,
      id: workId,
    });

    if (result.isErr()) {
      logger.warn({
        method: 'getWorkCharactersById',
        message: '作品情報の取得に失敗しました',
        error: result.error,
      });
      throw new Error(result.error.message);
    }

    const characterEdges =
      result.value.data.searchWorks.edges[0]?.node.casts.edges || [];
    const characterData = characterEdges.map((edge) => ({
      annictId: edge.node.character.annictId,
      name: edge.node.character.name,
    }));

    if (characterData.length === 0) {
      const message = encodeURIComponent(
        'この作品にはキャラクターが登録されていません。',
      );
      logger.error({
        message,
        workId,
        workName,
      });
      return c.redirect(`/register/work?status=error&message=${message}`, 303);
    }

    // 作品からキャラクター情報の取得
    const registeredCharactersResult = await getCharacterById({ DB, workId });

    if (registeredCharactersResult.isErr()) {
      logger.error({
        method: 'getCharacterById',
        message: '登録済みキャラクターIDの取得中に予期せぬエラーが発生しました',
        error: registeredCharactersResult.error,
      });
      throw new Error('登録済みキャラクター情報の取得に失敗しました。');
    }

    const registeredCharacterIds = registeredCharactersResult.value.map(
      (char: { characterId: number }) => char.characterId,
    );

    // 取得した作品情報から既に登録済みのキャラクターを除外する
    const unregisteredCharacters = characterData.filter(
      (char) => !registeredCharacterIds.includes(char.annictId),
    );

    if (unregisteredCharacters.length === 0) {
      const message = encodeURIComponent(
        'この作品には登録可能なキャラクターがありません。',
      );
      logger.error({
        message,
        workId,
        workName,
      });
      return c.redirect(`/register/work?status=error&message=${message}`, 303);
    }

    // 次画面で使用するためクエリパラメータに作品ID、作品名、キャラクター情報をJSON文字列としてセット
    const params = new URLSearchParams();
    params.set('workId', workId.toString());
    params.set('workName', workName);
    // キャラクター情報をJSON文字列に変換してセット
    params.set('characters', JSON.stringify(unregisteredCharacters));

    return c.redirect(`/register/character?${params.toString()}`, 303);
  },
);

export default createRoute(async (c) => {
  // キャラクター登録画面から、現在登録していない作品を取得します。
  // annictから作品情報を取得
  const result = await getWorks({
    clientId: c.env.ANNICT_CLIENT_ID,
  });

  if (result.isErr()) {
    throw new Error('作品情報の取得に失敗しました');
  }

  const resultList = result.value.data.searchWorks.nodes.map((node) => ({
    annictId: node.annictId,
    title: node.title,
  }));

  return c.render(
    <div className='max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg'>
      <h1 className='text-3xl font-bold text-center mb-8 text-white'>
        作品登録
      </h1>
      <form method='post' action='/register/work'>
        <WorkForm works={resultList} />
        <button
          type='submit'
          className='w-full bg-yellow-300 text-gray-900 py-2 px-4 rounded font-medium hover:bg-yellow-500 transition-colors'
        >
          次へ
        </button>
      </form>
    </div>,
  );
});
